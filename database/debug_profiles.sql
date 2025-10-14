-- プロファイルテーブルのデバッグクエリ

-- 1. 現在のすべてのプロファイルを確認
SELECT
  user_id,
  email,
  full_name,
  role,
  org_id,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- 2. ibron1975のプロファイルを検索
SELECT * FROM profiles WHERE email LIKE '%ibron1975%';

-- 3. yamamoto@iidzka.co.jpのプロファイルを検索
SELECT * FROM profiles WHERE email = 'yamamoto@iidzka.co.jp';

-- 4. adminロールのユーザーを確認
SELECT * FROM profiles WHERE role = 'admin';
