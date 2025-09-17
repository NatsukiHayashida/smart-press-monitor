-- プロファイルテーブルのorg_idを実際のデータに合わせて更新
UPDATE profiles 
SET org_id = '5aa33531-921a-4425-a235-770ed1f524c5'
WHERE user_id = '00000000-0000-0000-0000-000000000001';

-- 確認
SELECT * FROM profiles;