-- 既存テーブルのRLSを無効化
-- maintenance_schedulesが存在しない場合はエラーを無視

-- プレス機テーブルのRLS無効化
ALTER TABLE IF EXISTS press_machines DISABLE ROW LEVEL SECURITY;

-- メンテナンス記録テーブルのRLS無効化  
ALTER TABLE IF EXISTS maintenance_records DISABLE ROW LEVEL SECURITY;

-- プロファイルテーブルのRLS無効化
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;

-- メンテナンス予定テーブルのRLS無効化（存在する場合のみ）
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_schedules' AND table_schema = 'public') THEN
        ALTER TABLE maintenance_schedules DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'maintenance_schedules table RLS disabled';
    ELSE
        RAISE NOTICE 'maintenance_schedules table does not exist, skipping';
    END IF;
END $$;

-- 確認: 現在のRLS状態
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('press_machines', 'maintenance_records', 'profiles', 'maintenance_schedules')
ORDER BY tablename;