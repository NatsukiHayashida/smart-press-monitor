-- メンテナンス記録のリセットと更新
-- 1. 既存の総合判定を全て'B:一部修理'に更新
-- 2. IDシーケンスを1から開始するように再設定

-- Step 1: 既存の総合判定を'B:一部修理'に更新
UPDATE maintenance_records 
SET overall_judgment = 'B:一部修理';

-- Step 2: 現在のレコードを一時テーブルに保存
CREATE TEMP TABLE temp_maintenance AS 
SELECT 
  org_id,
  press_id,
  maintenance_datetime,
  'B:一部修理' as overall_judgment,  -- 全て B に設定
  clutch_valve_replacement,
  brake_valve_replacement,
  accumulated_shots,
  crank_press_shots,
  accumulated_crank_press_time_minutes,
  gear_type,
  gear_greasing,
  gear_condition,
  gear_remarks,
  interior_cleaning,
  exterior_cleaning,
  clutch_disks,
  clutch_brake_disks,
  clutch_lining_inspection,
  brake_lining_inspection,
  solenoid_valve_clutch,
  solenoid_valve_brake,
  drain_valve,
  slide_adjustment_motor_belt,
  slide_adjustment_motor_condition,
  balance_cylinder_condition,
  oil_seal_clutch_air_cylinder,
  oil_seal_balancer_cylinder,
  slide_guide_pin_bushing,
  encoder,
  flywheel_key,
  control_box_cleaning,
  grease_nipples,
  shaft_runout_measurement,
  remarks,
  created_at
FROM maintenance_records
ORDER BY id;  -- 元のID順を保持

-- Step 3: 既存のレコードを削除
DELETE FROM maintenance_records;

-- Step 4: シーケンスをリセット
ALTER SEQUENCE maintenance_records_id_seq RESTART WITH 1;

-- Step 5: データを再挿入（新しいIDが1から順番に振られる）
INSERT INTO maintenance_records (
  org_id,
  press_id,
  maintenance_datetime,
  overall_judgment,
  clutch_valve_replacement,
  brake_valve_replacement,
  accumulated_shots,
  crank_press_shots,
  accumulated_crank_press_time_minutes,
  gear_type,
  gear_greasing,
  gear_condition,
  gear_remarks,
  interior_cleaning,
  exterior_cleaning,
  clutch_disks,
  clutch_brake_disks,
  clutch_lining_inspection,
  brake_lining_inspection,
  solenoid_valve_clutch,
  solenoid_valve_brake,
  drain_valve,
  slide_adjustment_motor_belt,
  slide_adjustment_motor_condition,
  balance_cylinder_condition,
  oil_seal_clutch_air_cylinder,
  oil_seal_balancer_cylinder,
  slide_guide_pin_bushing,
  encoder,
  flywheel_key,
  control_box_cleaning,
  grease_nipples,
  shaft_runout_measurement,
  remarks,
  created_at
)
SELECT * FROM temp_maintenance;

-- Step 6: 一時テーブルを削除
DROP TABLE temp_maintenance;

-- 結果を確認
SELECT id, press_id, maintenance_datetime, overall_judgment 
FROM maintenance_records 
ORDER BY id 
LIMIT 10;