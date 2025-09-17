-- データ確認スクリプト

-- 1. プレス機データの確認
SELECT COUNT(*) as total_machines FROM press_machines;

-- 2. 指定org_idでのプレス機データ確認
SELECT COUNT(*) as org_machines 
FROM press_machines 
WHERE org_id = 'c897453e-14c7-4335-bdb4-91978778d95b';

-- 3. 存在するorg_idの一覧
SELECT DISTINCT org_id, COUNT(*) as machine_count 
FROM press_machines 
GROUP BY org_id;

-- 4. プロファイルテーブルの確認
SELECT * FROM profiles;

-- 5. RLS状態の確認
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('press_machines', 'maintenance_records', 'profiles');