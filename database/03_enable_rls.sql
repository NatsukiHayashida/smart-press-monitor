-- Step 3: RLSの再有効化（警告: これを実行すると権限チェックが有効になります）

-- RLSの再有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- 確認
SELECT
  schemaname,
  tablename,
  CASE WHEN rowsecurity THEN '有効' ELSE '無効' END as "RLS状態"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'press_machines', 'maintenance_records')
ORDER BY tablename;
