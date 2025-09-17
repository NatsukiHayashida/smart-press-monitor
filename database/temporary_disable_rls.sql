-- 一時的にRLSを無効にしてClerk認証をテスト
-- 注意: 本番環境では絶対に実行しないでください

-- プレス機テーブルのRLS無効化
ALTER TABLE press_machines DISABLE ROW LEVEL SECURITY;

-- メンテナンス記録テーブルのRLS無効化  
ALTER TABLE maintenance_records DISABLE ROW LEVEL SECURITY;

-- メンテナンス予定テーブルのRLS無効化
ALTER TABLE maintenance_schedules DISABLE ROW LEVEL SECURITY;

-- プロファイルテーブルのRLS無効化
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 確認用: テーブルの状態表示
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('press_machines', 'maintenance_records', 'maintenance_schedules', 'profiles');