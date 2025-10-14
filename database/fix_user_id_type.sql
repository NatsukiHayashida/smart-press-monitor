-- Clerk認証への移行に伴うuser_id型の修正
-- UUIDからTEXTに変更し、auth.usersへの外部キー制約を削除

-- ========================================
-- ステップ1: 既存のプロファイルをバックアップ
-- ========================================
CREATE TABLE IF NOT EXISTS profiles_backup AS
SELECT * FROM profiles;

-- 確認: バックアップが作成されたか
SELECT COUNT(*) as backup_count FROM profiles_backup;

-- ========================================
-- ステップ2: 現在のポリシーを確認
-- ========================================
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'orgs', 'press_machines', 'maintenance_records')
ORDER BY tablename, policyname;

-- ========================================
-- ステップ3: すべてのRLSポリシーを動的に削除
-- ========================================
-- 注意: 以下のクエリ結果をコピーして実行してください
SELECT 'DROP POLICY IF EXISTS "' || policyname || '" ON ' || tablename || ';'
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'orgs', 'press_machines', 'maintenance_records');

-- または、手動で以下を実行:
-- profilesテーブルのすべてのポリシー
DROP POLICY IF EXISTS profiles_select_own ON profiles;
DROP POLICY IF EXISTS profiles_insert_own ON profiles;
DROP POLICY IF EXISTS profiles_update_own ON profiles;
DROP POLICY IF EXISTS profiles_self ON profiles;
DROP POLICY IF EXISTS profiles_org_read ON profiles;
DROP POLICY IF EXISTS profiles_org_write ON profiles;
DROP POLICY IF EXISTS profiles_admin_all ON profiles;
DROP POLICY IF EXISTS profiles_select ON profiles;
DROP POLICY IF EXISTS profiles_insert ON profiles;
DROP POLICY IF EXISTS profiles_update ON profiles;
DROP POLICY IF EXISTS profiles_delete ON profiles;

-- orgsテーブルのすべてのポリシー
DROP POLICY IF EXISTS orgs_select ON orgs;
DROP POLICY IF EXISTS orgs_insert ON orgs;
DROP POLICY IF EXISTS orgs_update ON orgs;
DROP POLICY IF EXISTS orgs_delete ON orgs;
DROP POLICY IF EXISTS orgs_self ON orgs;
DROP POLICY IF EXISTS orgs_org_read ON orgs;

-- press_machinesテーブルのすべてのポリシー
DROP POLICY IF EXISTS press_machines_select ON press_machines;
DROP POLICY IF EXISTS press_machines_insert ON press_machines;
DROP POLICY IF EXISTS press_machines_update ON press_machines;
DROP POLICY IF EXISTS press_machines_delete ON press_machines;
DROP POLICY IF EXISTS press_machines_self ON press_machines;
DROP POLICY IF EXISTS press_machines_org_read ON press_machines;
DROP POLICY IF EXISTS press_machines_org_write ON press_machines;

-- maintenance_recordsテーブルのすべてのポリシー
DROP POLICY IF EXISTS maintenance_records_select ON maintenance_records;
DROP POLICY IF EXISTS maintenance_records_insert ON maintenance_records;
DROP POLICY IF EXISTS maintenance_records_update ON maintenance_records;
DROP POLICY IF EXISTS maintenance_records_delete ON maintenance_records;
DROP POLICY IF EXISTS maintenance_records_self ON maintenance_records;
DROP POLICY IF EXISTS maintenance_records_org_read ON maintenance_records;
DROP POLICY IF EXISTS maintenance_records_org_write ON maintenance_records;

-- ========================================
-- ステップ4: 外部キー制約を削除
-- ========================================
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- ========================================
-- ステップ5: user_idカラムの型をUUIDからTEXTに変更
-- ========================================
ALTER TABLE profiles
ALTER COLUMN user_id TYPE TEXT;

-- ========================================
-- ステップ6: 変更を確認
-- ========================================
SELECT
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name = 'user_id';

-- ========================================
-- ステップ7: 既存のプロファイルを確認
-- ========================================
SELECT
  user_id,
  email,
  full_name,
  role,
  org_id,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- ========================================
-- 参考: バックアップからのリストア方法
-- ========================================
-- もし問題が発生した場合、以下でリストアできます：
-- TRUNCATE profiles;
-- INSERT INTO profiles SELECT * FROM profiles_backup;
