-- シンプルな更新方法（既存のIDを保持したまま判定だけ変更）
-- こちらの方が安全で簡単です

-- Step 1: 全ての既存レコードの総合判定を'B:一部修理'に更新
UPDATE maintenance_records 
SET overall_judgment = 'B:一部修理'
WHERE overall_judgment IS NOT NULL;

-- Step 2: 今後の新規レコードのために、IDシーケンスの次の値を確認
-- （既存データがある場合、これは情報確認のみ）
SELECT MAX(id) + 1 as next_id FROM maintenance_records;

-- Step 3: 更新結果を確認
SELECT 
  id, 
  press_id, 
  maintenance_datetime, 
  overall_judgment,
  clutch_valve_replacement,
  brake_valve_replacement
FROM maintenance_records 
ORDER BY id;

-- メモ: 既存のIDをそのまま保持したい場合は、このスクリプトを使用してください
-- IDを1からリセットしたい場合は、reset_maintenance_records.sql を使用してください