-- Clerk認証用のRLS (Row Level Security) ポリシー更新
-- 既存のSupabase Auth用ポリシーをClerk対応に変更

-- Clerkユーザー情報を取得するヘルパー関数
CREATE OR REPLACE FUNCTION auth.clerk_user_id() RETURNS TEXT AS $$
BEGIN
  -- リクエストヘッダーからClerkユーザーIDを取得
  RETURN current_setting('request.headers.x-user-id', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- プロファイルテーブルのRLSポリシー更新
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (user_id = auth.clerk_user_id());

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (user_id = auth.clerk_user_id());

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (user_id = auth.clerk_user_id());

-- プレス機械テーブルのRLSポリシー更新
DROP POLICY IF EXISTS "Users can view org machines" ON press_machines;
DROP POLICY IF EXISTS "Users can insert org machines" ON press_machines;
DROP POLICY IF EXISTS "Users can update org machines" ON press_machines;
DROP POLICY IF EXISTS "Users can delete org machines" ON press_machines;

CREATE POLICY "Users can view org machines" ON press_machines
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "Users can insert org machines" ON press_machines
    FOR INSERT WITH CHECK (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "Users can update org machines" ON press_machines
    FOR UPDATE USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "Users can delete org machines" ON press_machines
    FOR DELETE USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

-- メンテナンス記録テーブルのRLSポリシー更新
DROP POLICY IF EXISTS "Users can view org maintenance" ON maintenance_records;
DROP POLICY IF EXISTS "Users can insert org maintenance" ON maintenance_records;
DROP POLICY IF EXISTS "Users can update org maintenance" ON maintenance_records;
DROP POLICY IF EXISTS "Users can delete org maintenance" ON maintenance_records;

CREATE POLICY "Users can view org maintenance" ON maintenance_records
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "Users can insert org maintenance" ON maintenance_records
    FOR INSERT WITH CHECK (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "Users can update org maintenance" ON maintenance_records
    FOR UPDATE USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "Users can delete org maintenance" ON maintenance_records
    FOR DELETE USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

-- メンテナンス予定テーブルのRLSポリシー更新
DROP POLICY IF EXISTS "Users can view org schedules" ON maintenance_schedules;
DROP POLICY IF EXISTS "Users can insert org schedules" ON maintenance_schedules;
DROP POLICY IF EXISTS "Users can update org schedules" ON maintenance_schedules;
DROP POLICY IF EXISTS "Users can delete org schedules" ON maintenance_schedules;

CREATE POLICY "Users can view org schedules" ON maintenance_schedules
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "Users can insert org schedules" ON maintenance_schedules
    FOR INSERT WITH CHECK (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "Users can update org schedules" ON maintenance_schedules
    FOR UPDATE USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );

CREATE POLICY "Users can delete org schedules" ON maintenance_schedules
    FOR DELETE USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE user_id = auth.clerk_user_id()
        )
    );