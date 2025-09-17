-- UUIDエラーの解決

-- 1. 既存のプロファイルテーブル構造確認
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. 既存のデータ確認
SELECT COUNT(*) as profile_count FROM profiles;

-- 3. 暫定的な解決策: 固定UUIDでClerkユーザー作成
-- （後でClerkユーザーIDとマッピングするテーブルを作成）
DO $$
DECLARE
    temp_org_id UUID;
    temp_user_uuid UUID := '00000000-0000-0000-0000-000000000001'; -- 固定UUID
BEGIN
    -- 既存のorg_idを取得
    SELECT DISTINCT org_id INTO temp_org_id FROM press_machines LIMIT 1;
    
    -- プロファイル挿入（重複があれば無視）
    INSERT INTO profiles (user_id, org_id, email, full_name, created_at) 
    VALUES (
        temp_user_uuid,
        temp_org_id,
        'clerk-test@example.com',
        'Clerk Test User',
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Clerk user profile created with UUID: %', temp_user_uuid;
    RAISE NOTICE 'Using org_id: %', temp_org_id;
END $$;

-- 4. 作成されたプロファイル確認
SELECT * FROM profiles WHERE email = 'clerk-test@example.com';