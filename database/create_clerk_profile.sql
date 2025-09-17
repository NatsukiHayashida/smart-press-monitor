-- Clerkユーザー用のプロファイル作成

-- 既存のプロファイルテーブル構造を確認
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 既存のorg_idを確認
SELECT DISTINCT org_id FROM press_machines LIMIT 5;

-- Clerkユーザー用プロファイル作成
-- UUIDを生成してuser_idとして使用
INSERT INTO profiles (user_id, org_id, email, full_name, created_at) 
SELECT 
  gen_random_uuid(), -- ランダムUUID生成
  org_id,
  'clerk-temp@example.com', -- 後で実際のメールアドレスに更新
  'Clerk Temp User',
  NOW()
FROM (
  SELECT DISTINCT org_id FROM press_machines LIMIT 1
) AS existing_org;

-- 確認
SELECT * FROM profiles;