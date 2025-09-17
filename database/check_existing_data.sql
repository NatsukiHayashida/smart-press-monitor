-- 既存のテーブル構造とデータを確認

-- 1. 存在するテーブル一覧
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. 各テーブルの列情報
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. プレス機テーブルの構造（存在する場合）
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'press_machines'
ORDER BY ordinal_position;

-- 4. メンテナンス記録テーブルの構造（存在する場合）
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'maintenance_records'
ORDER BY ordinal_position;

-- 5. 既存データのカウント（存在するテーブルのみ）
DO $$
BEGIN
    -- プレス機テーブルのカウント
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'press_machines' AND table_schema = 'public') THEN
        RAISE NOTICE 'press_machines table exists';
    ELSE
        RAISE NOTICE 'press_machines table does not exist';
    END IF;
    
    -- メンテナンス記録テーブルのカウント
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_records' AND table_schema = 'public') THEN
        RAISE NOTICE 'maintenance_records table exists';
    ELSE
        RAISE NOTICE 'maintenance_records table does not exist';
    END IF;
    
    -- プロファイルテーブルのカウント
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        RAISE NOTICE 'profiles table exists';
    ELSE
        RAISE NOTICE 'profiles table does not exist';
    END IF;
END $$;