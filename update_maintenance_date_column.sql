-- メンテナンス日時カラムを日付のみに変更
-- maintenance_datetime を maintenance_date に変更

-- Step 1: 新しいカラムを追加
ALTER TABLE maintenance_records 
ADD COLUMN IF NOT EXISTS maintenance_date DATE;

-- Step 2: 既存のdatetimeデータから日付部分のみをコピー
UPDATE maintenance_records 
SET maintenance_date = maintenance_datetime::DATE
WHERE maintenance_datetime IS NOT NULL;

-- Step 3: NOT NULL制約を追加
ALTER TABLE maintenance_records 
ALTER COLUMN maintenance_date SET NOT NULL;

-- Step 4: 古いカラムを削除
ALTER TABLE maintenance_records 
DROP COLUMN maintenance_datetime;

-- Step 5: カラム名を正しい位置に配置するため、ビューを作成（オプション）
-- または、アプリケーション側で maintenance_date を使用するように変更

-- 結果を確認
SELECT 
  id, 
  press_id, 
  maintenance_date,
  overall_judgment
FROM maintenance_records 
ORDER BY maintenance_date DESC, id
LIMIT 10;