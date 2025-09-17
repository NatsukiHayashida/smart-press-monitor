-- クイック設定スクリプト（順番に実行）

-- 1. RLS無効化
ALTER TABLE IF EXISTS press_machines DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS maintenance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;

-- 2. 外部キー制約削除
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- 3. Clerkユーザー用プロファイル作成
INSERT INTO profiles (user_id, org_id, email, full_name, created_at) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'c897453e-14c7-4335-bdb4-91978778d95b',
    'clerk-test@example.com',
    'Clerk Test User',
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    org_id = EXCLUDED.org_id,
    email = EXCLUDED.email;