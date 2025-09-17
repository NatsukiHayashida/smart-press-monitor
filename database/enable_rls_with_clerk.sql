-- ============================================
-- Clerk認証と連携したRLSポリシーの実装
-- ============================================
-- 
-- 実行前の注意事項:
-- 1. このスクリプトを実行する前に、既存のデータをバックアップしてください
-- 2. 開発環境で十分にテストしてから本番環境に適用してください
-- 3. Supabaseクライアントでカスタムヘッダーを送信する設定が必要です

-- ============================================
-- Step 1: Clerk User ID取得用の関数作成
-- ============================================

-- 既存の関数を削除（存在する場合）
DROP FUNCTION IF EXISTS get_clerk_user_id();
DROP FUNCTION IF EXISTS get_clerk_org_id();

-- ClerkユーザーIDを取得する関数
CREATE OR REPLACE FUNCTION get_clerk_user_id()
RETURNS TEXT AS $$
BEGIN
  -- リクエストヘッダーからClerkユーザーIDを取得
  RETURN current_setting('request.headers', true)::json->>'x-clerk-user-id';
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clerk組織IDを取得する関数
CREATE OR REPLACE FUNCTION get_clerk_org_id()
RETURNS TEXT AS $$
BEGIN
  -- リクエストヘッダーからClerk組織IDを取得
  RETURN current_setting('request.headers', true)::json->>'x-clerk-org-id';
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Service Roleかどうかを確認する関数
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  -- JWTクレームからロールを確認
  RETURN current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Step 2: RLSを有効化（まだ有効化していない場合）
-- ============================================

-- profiles テーブル
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- orgs テーブル
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;

-- press_machines テーブル
ALTER TABLE press_machines ENABLE ROW LEVEL SECURITY;

-- maintenance_records テーブル
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 3: 既存のポリシーを削除
-- ============================================

-- profilesテーブルの既存ポリシーを削除
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role has full access to profiles" ON profiles;

-- orgsテーブルの既存ポリシーを削除
DROP POLICY IF EXISTS "Users can view own organization" ON orgs;
DROP POLICY IF EXISTS "Service role has full access to organizations" ON orgs;

-- press_machinesテーブルの既存ポリシーを削除
DROP POLICY IF EXISTS "Users can view machines in their org" ON press_machines;
DROP POLICY IF EXISTS "Users can insert machines in their org" ON press_machines;
DROP POLICY IF EXISTS "Users can update machines in their org" ON press_machines;
DROP POLICY IF EXISTS "Users can delete machines in their org" ON press_machines;
DROP POLICY IF EXISTS "Service role has full access to machines" ON press_machines;

-- maintenance_recordsテーブルの既存ポリシーを削除
DROP POLICY IF EXISTS "Users can view maintenance records in their org" ON maintenance_records;
DROP POLICY IF EXISTS "Users can insert maintenance records in their org" ON maintenance_records;
DROP POLICY IF EXISTS "Users can update maintenance records in their org" ON maintenance_records;
DROP POLICY IF EXISTS "Users can delete maintenance records in their org" ON maintenance_records;
DROP POLICY IF EXISTS "Service role has full access to maintenance" ON maintenance_records;

-- ============================================
-- Step 4: 新しいRLSポリシーを作成
-- ============================================

-- ----- profiles テーブルのポリシー -----

-- Service Roleは全アクセス可能
CREATE POLICY "Service role has full access to profiles"
ON profiles FOR ALL
USING (is_service_role());

-- ユーザーは自分のプロフィールのみ閲覧可能
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (
  user_id = get_clerk_user_id()
  OR is_service_role()
);

-- ユーザーは自分のプロフィールのみ更新可能
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (
  user_id = get_clerk_user_id()
  OR is_service_role()
)
WITH CHECK (
  user_id = get_clerk_user_id()
  OR is_service_role()
);

-- ----- orgs テーブルのポリシー -----

-- Service Roleは全アクセス可能
CREATE POLICY "Service role has full access to organizations"
ON orgs FOR ALL
USING (is_service_role());

-- ユーザーは自分の組織のみ閲覧可能
CREATE POLICY "Users can view own organization"
ON orgs FOR SELECT
USING (
  id IN (
    SELECT org_id FROM profiles WHERE user_id = get_clerk_user_id()
  )
  OR is_service_role()
);

-- ----- press_machines テーブルのポリシー -----

-- Service Roleは全アクセス可能
CREATE POLICY "Service role has full access to machines"
ON press_machines FOR ALL
USING (is_service_role());

-- ユーザーは自分の組織の機械のみ閲覧可能
CREATE POLICY "Users can view machines in their org"
ON press_machines FOR SELECT
USING (
  org_id IN (
    SELECT org_id FROM profiles WHERE user_id = get_clerk_user_id()
  )
  OR is_service_role()
);

-- ユーザーは自分の組織に機械を追加可能
CREATE POLICY "Users can insert machines in their org"
ON press_machines FOR INSERT
WITH CHECK (
  org_id IN (
    SELECT org_id FROM profiles WHERE user_id = get_clerk_user_id()
  )
  OR is_service_role()
);

-- ユーザーは自分の組織の機械を更新可能
CREATE POLICY "Users can update machines in their org"
ON press_machines FOR UPDATE
USING (
  org_id IN (
    SELECT org_id FROM profiles WHERE user_id = get_clerk_user_id()
  )
  OR is_service_role()
)
WITH CHECK (
  org_id IN (
    SELECT org_id FROM profiles WHERE user_id = get_clerk_user_id()
  )
  OR is_service_role()
);

-- ユーザーは自分の組織の機械を削除可能
CREATE POLICY "Users can delete machines in their org"
ON press_machines FOR DELETE
USING (
  org_id IN (
    SELECT org_id FROM profiles WHERE user_id = get_clerk_user_id()
  )
  OR is_service_role()
);

-- ----- maintenance_records テーブルのポリシー -----

-- Service Roleは全アクセス可能
CREATE POLICY "Service role has full access to maintenance"
ON maintenance_records FOR ALL
USING (is_service_role());

-- ユーザーは自分の組織のメンテナンス記録のみ閲覧可能
CREATE POLICY "Users can view maintenance records in their org"
ON maintenance_records FOR SELECT
USING (
  org_id IN (
    SELECT org_id FROM profiles WHERE user_id = get_clerk_user_id()
  )
  OR is_service_role()
);

-- ユーザーは自分の組織にメンテナンス記録を追加可能
CREATE POLICY "Users can insert maintenance records in their org"
ON maintenance_records FOR INSERT
WITH CHECK (
  org_id IN (
    SELECT org_id FROM profiles WHERE user_id = get_clerk_user_id()
  )
  OR is_service_role()
);

-- ユーザーは自分の組織のメンテナンス記録を更新可能
CREATE POLICY "Users can update maintenance records in their org"
ON maintenance_records FOR UPDATE
USING (
  org_id IN (
    SELECT org_id FROM profiles WHERE user_id = get_clerk_user_id()
  )
  OR is_service_role()
)
WITH CHECK (
  org_id IN (
    SELECT org_id FROM profiles WHERE user_id = get_clerk_user_id()
  )
  OR is_service_role()
);

-- ユーザーは自分の組織のメンテナンス記録を削除可能
CREATE POLICY "Users can delete maintenance records in their org"
ON maintenance_records FOR DELETE
USING (
  org_id IN (
    SELECT org_id FROM profiles WHERE user_id = get_clerk_user_id()
  )
  OR is_service_role()
);

-- ============================================
-- Step 5: 動作確認用のクエリ
-- ============================================

-- 関数の動作テスト（実行後、NULLが返るはずです - ヘッダーがないため）
SELECT get_clerk_user_id() AS clerk_user_id;
SELECT get_clerk_org_id() AS clerk_org_id;
SELECT is_service_role() AS is_service_role;

-- RLSが有効になっているテーブルの確認
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'orgs', 'press_machines', 'maintenance_records')
ORDER BY tablename;

-- ポリシーの確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'orgs', 'press_machines', 'maintenance_records')
ORDER BY tablename, policyname;

-- ============================================
-- 実行後の注意事項:
-- 1. アプリケーション側でカスタムヘッダーの設定が必要です
-- 2. すべてのAPIリクエストでx-clerk-user-idヘッダーを送信する必要があります
-- 3. Service Roleキーは管理操作用にサーバーサイドでのみ使用してください
-- ============================================