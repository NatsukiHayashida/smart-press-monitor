-- 総合判定の値を新しい形式に更新
-- A:良好、B:一部修理、C:至急修理を要す

-- 既存データの変換
UPDATE maintenance_records
SET overall_judgment = CASE
  WHEN overall_judgment = '良好' THEN 'A:良好'
  WHEN overall_judgment = '要注意' THEN 'B:一部修理'
  WHEN overall_judgment = '要修理' THEN 'C:至急修理を要す'
  WHEN overall_judgment = '異常' THEN 'C:至急修理を要す'
  ELSE overall_judgment
END
WHERE overall_judgment IN ('良好', '要注意', '要修理', '異常');

-- CHECK制約を更新（既存の制約があれば削除してから追加）
ALTER TABLE maintenance_records 
DROP CONSTRAINT IF EXISTS maintenance_records_overall_judgment_check;

ALTER TABLE maintenance_records
ADD CONSTRAINT maintenance_records_overall_judgment_check
CHECK (overall_judgment IN ('A:良好', 'B:一部修理', 'C:至急修理を要す'));

-- デフォルト値を更新
ALTER TABLE maintenance_records
ALTER COLUMN overall_judgment SET DEFAULT 'A:良好';