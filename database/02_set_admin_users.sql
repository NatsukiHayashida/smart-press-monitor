-- Step 2: 管理者ユーザーの設定

-- 指定されたメールアドレスをadminに設定
UPDATE profiles
SET role = 'admin'
WHERE email IN ('ibron1975@gmail.com', 'yamamoto@iidzka.co.jp');

-- その他のユーザーはviewerに設定（念のため）
UPDATE profiles
SET role = 'viewer'
WHERE email NOT IN ('ibron1975@gmail.com', 'yamamoto@iidzka.co.jp')
  AND role IS NULL;

-- 確認
SELECT user_id, email, full_name, role FROM profiles ORDER BY role DESC, email;
