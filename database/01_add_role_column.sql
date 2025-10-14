-- Step 1: profilesテーブルにroleカラム追加

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'viewer';
    RAISE NOTICE 'roleカラムを追加しました';
  ELSE
    RAISE NOTICE 'roleカラムは既に存在します';
  END IF;
END $$;
