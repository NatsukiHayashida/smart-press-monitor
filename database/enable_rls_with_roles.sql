-- RLS再有効化 - 権限ベースのアクセス制御
-- 編集権限: ibron1975@gmail.com, yamamoto@iidzka.co.jp のみ
-- その他: 閲覧のみ

-- ===========================
-- Step 1: profilesテーブルにroleカラム追加
-- ===========================

-- roleカラムが存在しない場合のみ追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'viewer';
    RAISE NOTICE 'roleカラムを追加しました';
  ELSE
    RAISE NOTICE 'roleカラムは既に存在します';
  END IF;
END $$;

-- ===========================
-- Step 2: 管理者ユーザーの設定
-- ===========================

-- 指定されたメールアドレスをadminに設定
UPDATE profiles
SET role = 'admin'
WHERE email IN ('ibron1975@gmail.com', 'yamamoto@iidzka.co.jp');

-- その他のユーザーはviewerに設定（念のため）
UPDATE profiles
SET role = 'viewer'
WHERE email NOT IN ('ibron1975@gmail.com', 'yamamoto@iidzka.co.jp')
  AND role IS NULL;

-- ===========================
-- Step 3: Clerk用ヘルパー関数の作成
-- ===========================

-- Clerkユーザー情報を取得するヘルパー関数
CREATE OR REPLACE FUNCTION auth.clerk_user_id()
RETURNS TEXT AS $$
BEGIN
  -- ClerkのuserIdを取得（Server Actionsで設定されたカスタムクレーム）
  RETURN current_setting('request.jwt.claims', true)::json->>'sub';
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザーのロールを取得するヘルパー関数
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE user_id = auth.clerk_user_id();

  RETURN COALESCE(user_role, 'viewer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ユーザーがadminかどうかをチェックする関数
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================
-- Step 4: 既存ポリシーの削除
-- ===========================

-- プロファイルテーブル
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- プレス機テーブル
DROP POLICY IF EXISTS "press_machines_select" ON press_machines;
DROP POLICY IF EXISTS "press_machines_insert" ON press_machines;
DROP POLICY IF EXISTS "press_machines_update" ON press_machines;
DROP POLICY IF EXISTS "press_machines_delete" ON press_machines;
DROP POLICY IF EXISTS "Users can view org machines" ON press_machines;
DROP POLICY IF EXISTS "Users can insert org machines" ON press_machines;
DROP POLICY IF EXISTS "Users can update org machines" ON press_machines;
DROP POLICY IF EXISTS "Users can delete org machines" ON press_machines;

-- メンテナンス記録テーブル
DROP POLICY IF EXISTS "maintenance_records_select" ON maintenance_records;
DROP POLICY IF EXISTS "maintenance_records_insert" ON maintenance_records;
DROP POLICY IF EXISTS "maintenance_records_update" ON maintenance_records;
DROP POLICY IF EXISTS "maintenance_records_delete" ON maintenance_records;
DROP POLICY IF EXISTS "Users can view org maintenance" ON maintenance_records;
DROP POLICY IF EXISTS "Users can insert org maintenance" ON maintenance_records;
DROP POLICY IF EXISTS "Users can update org maintenance" ON maintenance_records;
DROP POLICY IF EXISTS "Users can delete org maintenance" ON maintenance_records;

-- メンテナンス予定テーブル（存在する場合）
DROP POLICY IF EXISTS "maintenance_schedules_select" ON maintenance_schedules;
DROP POLICY IF EXISTS "maintenance_schedules_insert" ON maintenance_schedules;
DROP POLICY IF EXISTS "maintenance_schedules_update" ON maintenance_schedules;
DROP POLICY IF EXISTS "maintenance_schedules_delete" ON maintenance_schedules;
DROP POLICY IF EXISTS "Users can view org schedules" ON maintenance_schedules;
DROP POLICY IF EXISTS "Users can insert org schedules" ON maintenance_schedules;
DROP POLICY IF EXISTS "Users can update org schedules" ON maintenance_schedules;
DROP POLICY IF EXISTS "Users can delete org schedules" ON maintenance_schedules;

-- ===========================
-- Step 5: 新しいRLSポリシーの作成
-- ===========================

-- --------------------------
-- profilesテーブル
-- --------------------------

-- 閲覧: 自分のプロファイルのみ
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (user_id = auth.clerk_user_id());

-- 挿入: 自分のプロファイルのみ
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (user_id = auth.clerk_user_id());

-- 更新: 自分のプロファイルのみ
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (user_id = auth.clerk_user_id());

-- --------------------------
-- press_machinesテーブル
-- --------------------------

-- 閲覧: 同じ組織の全ユーザー
CREATE POLICY "press_machines_select" ON press_machines
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.clerk_user_id()
        AND org_id = press_machines.org_id
    )
  );

-- 挿入: adminロールのみ
CREATE POLICY "press_machines_insert" ON press_machines
  FOR INSERT
  WITH CHECK (
    auth.is_admin() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.clerk_user_id()
        AND org_id = press_machines.org_id
    )
  );

-- 更新: adminロールのみ
CREATE POLICY "press_machines_update" ON press_machines
  FOR UPDATE
  USING (
    auth.is_admin() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.clerk_user_id()
        AND org_id = press_machines.org_id
    )
  );

-- 削除: adminロールのみ
CREATE POLICY "press_machines_delete" ON press_machines
  FOR DELETE
  USING (
    auth.is_admin() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.clerk_user_id()
        AND org_id = press_machines.org_id
    )
  );

-- --------------------------
-- maintenance_recordsテーブル
-- --------------------------

-- 閲覧: 同じ組織の全ユーザー
CREATE POLICY "maintenance_records_select" ON maintenance_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.clerk_user_id()
        AND org_id = maintenance_records.org_id
    )
  );

-- 挿入: adminロールのみ
CREATE POLICY "maintenance_records_insert" ON maintenance_records
  FOR INSERT
  WITH CHECK (
    auth.is_admin() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.clerk_user_id()
        AND org_id = maintenance_records.org_id
    )
  );

-- 更新: adminロールのみ
CREATE POLICY "maintenance_records_update" ON maintenance_records
  FOR UPDATE
  USING (
    auth.is_admin() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.clerk_user_id()
        AND org_id = maintenance_records.org_id
    )
  );

-- 削除: adminロールのみ
CREATE POLICY "maintenance_records_delete" ON maintenance_records
  FOR DELETE
  USING (
    auth.is_admin() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.clerk_user_id()
        AND org_id = maintenance_records.org_id
    )
  );

-- ===========================
-- Step 6: RLSの再有効化
-- ===========================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- maintenance_schedulesテーブルが存在する場合のみ有効化
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'maintenance_schedules'
  ) THEN
    ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'maintenance_schedulesのRLSを有効化しました';
  END IF;
END $$;

-- ===========================
-- Step 7: 確認クエリ
-- ===========================

-- RLS状態の確認
SELECT
  schemaname,
  tablename,
  rowsecurity as "RLS有効"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'press_machines', 'maintenance_records', 'maintenance_schedules')
ORDER BY tablename;

-- ポリシーの確認
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as "操作",
  CASE
    WHEN roles = '{public}' THEN '全ユーザー'
    ELSE array_to_string(roles, ', ')
  END as "適用対象"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 管理者ユーザーの確認
SELECT
  user_id,
  email,
  full_name,
  role,
  created_at
FROM profiles
WHERE role = 'admin'
ORDER BY email;

-- 全ユーザーのロール確認
SELECT
  user_id,
  email,
  full_name,
  role,
  org_id
FROM profiles
ORDER BY role DESC, email;
