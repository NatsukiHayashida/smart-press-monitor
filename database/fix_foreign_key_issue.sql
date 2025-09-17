-- 外部キー制約エラーの解決

-- 1. profilesテーブルの制約確認
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'profiles';

-- 2. usersテーブルの存在確認
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';

-- 3. 既存のusersテーブルのデータ確認（存在する場合）
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        RAISE NOTICE 'users table exists';
        -- usersテーブルのサンプルデータを表示
        PERFORM * FROM users LIMIT 3;
    ELSE
        RAISE NOTICE 'users table does not exist';
    END IF;
END $$;

-- 4. 解決策1: 既存ユーザーの場合
-- 既存のusersテーブルにレコードがある場合、そのuser_idを使用
DO $$
DECLARE
    existing_user_id UUID;
    temp_org_id UUID;
BEGIN
    -- 既存のユーザーIDを取得
    SELECT id INTO existing_user_id FROM users LIMIT 1;
    
    -- 既存のorg_idを取得
    SELECT DISTINCT org_id INTO temp_org_id FROM press_machines LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
        -- 既存ユーザーIDでプロファイル作成
        INSERT INTO profiles (user_id, org_id, email, full_name, created_at) 
        VALUES (
            existing_user_id,
            temp_org_id,
            'clerk-test@example.com',
            'Clerk Test User',
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name;
        
        RAISE NOTICE 'Profile created with existing user_id: %', existing_user_id;
    ELSE
        RAISE NOTICE 'No existing users found';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error occurred: %', SQLERRM;
END $$;