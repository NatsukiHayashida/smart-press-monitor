-- マイグレーション: Supabase AuthからClerk認証への移行
-- 実行前にデータベースのバックアップを推奨

BEGIN;

-- 1. Clerkユーザー情報を取得するヘルパー関数の作成
CREATE OR REPLACE FUNCTION auth.clerk_user_id() RETURNS TEXT AS $$
BEGIN
  -- リクエストヘッダーからClerkユーザーIDを取得
  RETURN current_setting('request.headers.x-user-id', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. profilesテーブルの外部キー制約を削除（auth.usersへの参照を削除）
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- 3. profilesテーブルのuser_id列をVARCHAR(255)に変更（ClerkのユーザーIDに対応）
ALTER TABLE profiles ALTER COLUMN user_id TYPE VARCHAR(255);

-- 4. maintenance_schedulesテーブルのcreated_by列をVARCHAR(255)に変更
ALTER TABLE maintenance_schedules DROP CONSTRAINT IF EXISTS maintenance_schedules_created_by_fkey;
ALTER TABLE maintenance_schedules ALTER COLUMN created_by TYPE VARCHAR(255);

-- 5. 既存のRLSポリシーをドロップ
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view org machines" ON press_machines;
DROP POLICY IF EXISTS "Users can insert org machines" ON press_machines;
DROP POLICY IF EXISTS "Users can update org machines" ON press_machines;
DROP POLICY IF EXISTS "Users can delete org machines" ON press_machines;

DROP POLICY IF EXISTS "Users can view org maintenance" ON maintenance_records;
DROP POLICY IF EXISTS "Users can insert org maintenance" ON maintenance_records;
DROP POLICY IF EXISTS "Users can update org maintenance" ON maintenance_records;
DROP POLICY IF EXISTS "Users can delete org maintenance" ON maintenance_records;

DROP POLICY IF EXISTS "Users can view org schedules" ON maintenance_schedules;
DROP POLICY IF EXISTS "Users can insert org schedules" ON maintenance_schedules;
DROP POLICY IF EXISTS "Users can update org schedules" ON maintenance_schedules;
DROP POLICY IF EXISTS "Users can delete org schedules" ON maintenance_schedules;

-- 6. Clerk認証用の新しいRLSポリシーを作成

-- プロファイルテーブル
CREATE POLICY "clerk_users_can_view_own_profile" ON profiles
    FOR SELECT USING (user_id = auth.clerk_user_id());

CREATE POLICY "clerk_users_can_update_own_profile" ON profiles
    FOR UPDATE USING (user_id = auth.clerk_user_id());

CREATE POLICY "clerk_users_can_insert_own_profile" ON profiles
    FOR INSERT WITH CHECK (user_id = auth.clerk_user_id());

-- プレス機械テーブル
CREATE POLICY "clerk_users_can_view_org_machines" ON press_machines
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "clerk_users_can_insert_org_machines" ON press_machines
    FOR INSERT WITH CHECK (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "clerk_users_can_update_org_machines" ON press_machines
    FOR UPDATE USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "clerk_users_can_delete_org_machines" ON press_machines
    FOR DELETE USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

-- メンテナンス記録テーブル
CREATE POLICY "clerk_users_can_view_org_maintenance" ON maintenance_records
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "clerk_users_can_insert_org_maintenance" ON maintenance_records
    FOR INSERT WITH CHECK (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "clerk_users_can_update_org_maintenance" ON maintenance_records
    FOR UPDATE USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "clerk_users_can_delete_org_maintenance" ON maintenance_records
    FOR DELETE USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

-- メンテナンス予定テーブル
CREATE POLICY "clerk_users_can_view_org_schedules" ON maintenance_schedules
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "clerk_users_can_insert_org_schedules" ON maintenance_schedules
    FOR INSERT WITH CHECK (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "clerk_users_can_update_org_schedules" ON maintenance_schedules
    FOR UPDATE USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "clerk_users_can_delete_org_schedules" ON maintenance_schedules
    FOR DELETE USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

COMMIT;

-- マイグレーション完了
-- 次のステップ：
-- 1. アプリケーションを新しいClerk認証フローでテスト
-- 2. 既存のSupabase Authユーザーをマニュアルで移行（必要に応じて）
-- 3. auth.usersテーブルは保持（将来的にクリーンアップ可能）