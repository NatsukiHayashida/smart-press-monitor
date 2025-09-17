-- 外部キー制約の削除（Clerk認証への移行のため）

-- 1. 制約名を確認
SELECT constraint_name 
FROM information_schema.table_constraints 
WHERE table_name = 'profiles' 
    AND constraint_type = 'FOREIGN KEY';

-- 2. profilesテーブルの外部キー制約を削除
-- 注: この操作により、profilesテーブルがusersテーブルから独立します
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey1;

-- 3. 削除確認
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'profiles';

-- 4. Clerk用プロファイル作成（制約削除後）
DO $$
DECLARE
    temp_org_id UUID;
    temp_user_uuid UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    -- 既存のorg_idを取得
    SELECT DISTINCT org_id INTO temp_org_id FROM press_machines LIMIT 1;
    
    -- プロファイル挿入
    INSERT INTO profiles (user_id, org_id, email, full_name, created_at) 
    VALUES (
        temp_user_uuid,
        temp_org_id,
        'clerk-test@example.com',
        'Clerk Test User',
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        org_id = EXCLUDED.org_id,
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;
    
    RAISE NOTICE 'Clerk profile created successfully with UUID: %', temp_user_uuid;
    RAISE NOTICE 'Using org_id: %', temp_org_id;
END $$;

-- 5. 作成確認
SELECT * FROM profiles WHERE email = 'clerk-test@example.com';