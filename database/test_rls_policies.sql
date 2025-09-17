-- ============================================
-- RLSポリシーのテストと検証
-- ============================================
-- このファイルは実際にRLSを有効化する前にテストするためのものです

-- 1. 現在のRLS状態を確認
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity = true THEN '✅ 有効'
    ELSE '❌ 無効'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'orgs', 'press_machines', 'maintenance_records')
ORDER BY tablename;

-- 2. 既存のポリシーを確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  ARRAY_TO_STRING(roles, ', ') as roles,
  cmd,
  CASE
    WHEN cmd = 'ALL' THEN '全操作'
    WHEN cmd = 'SELECT' THEN '読取'
    WHEN cmd = 'INSERT' THEN '作成'
    WHEN cmd = 'UPDATE' THEN '更新'
    WHEN cmd = 'DELETE' THEN '削除'
  END as action
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'orgs', 'press_machines', 'maintenance_records')
ORDER BY tablename, policyname;

-- 3. 現在のデータ件数を確認（RLS適用前のベースライン）
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'orgs', COUNT(*) FROM orgs
UNION ALL
SELECT 'press_machines', COUNT(*) FROM press_machines
UNION ALL
SELECT 'maintenance_records', COUNT(*) FROM maintenance_records
ORDER BY table_name;

-- 4. RLS関数のテスト（ヘッダーなしでNULLが返るはず）
SELECT 
  get_clerk_user_id() AS clerk_user_id,
  get_clerk_org_id() AS clerk_org_id,
  is_service_role() AS is_service_role;

-- 5. 特定のユーザーIDでのシミュレーション
-- 注意: これはテスト用です。実際の運用では使用しないでください
DO $$
DECLARE
  test_user_id TEXT := '00000000-0000-0000-0000-000000000001';
  test_org_id UUID := '5aa33531-921a-4425-a235-770ed1f524c5'::UUID;
  machine_count INTEGER;
  maintenance_count INTEGER;
BEGIN
  -- テスト用のヘッダー設定をシミュレート（実際にはアプリケーションから送信される）
  -- この部分はコメントアウトしています（実際のテストでは必要に応じて有効化）
  -- PERFORM set_config('request.headers', json_build_object('x-clerk-user-id', test_user_id)::text, true);
  
  -- 現在のユーザーのデータアクセス可能範囲を確認
  SELECT COUNT(*) INTO machine_count 
  FROM press_machines 
  WHERE org_id = test_org_id;
  
  SELECT COUNT(*) INTO maintenance_count
  FROM maintenance_records
  WHERE org_id = test_org_id;
  
  RAISE NOTICE 'テスト組織ID: %', test_org_id;
  RAISE NOTICE 'アクセス可能な機械数: %', machine_count;
  RAISE NOTICE 'アクセス可能なメンテナンス記録数: %', maintenance_count;
END $$;

-- 6. RLSが正しく動作するかの確認クエリ（RLS有効化後に実行）
-- 以下のクエリは、RLSが有効な状態で実行すると、
-- ユーザーがアクセス可能なデータのみが表示されます

/*
-- RLS有効化後のテストクエリ例

-- a. 自分のプロフィール情報のみ取得できるか
SELECT * FROM profiles WHERE user_id = get_clerk_user_id();

-- b. 自分の組織の機械のみ取得できるか  
SELECT * FROM press_machines 
WHERE org_id IN (
  SELECT org_id FROM profiles WHERE user_id = get_clerk_user_id()
);

-- c. 他の組織のデータにアクセスできないか（0件になるはず）
SELECT * FROM press_machines 
WHERE org_id NOT IN (
  SELECT org_id FROM profiles WHERE user_id = get_clerk_user_id()
);

-- d. Service Roleでのアクセステスト（すべてアクセス可能）
-- これはService Role Keyを使用した場合のみ動作
SELECT COUNT(*) as total_machines FROM press_machines;
*/

-- 7. パフォーマンスへの影響を確認
EXPLAIN ANALYZE
SELECT * FROM press_machines
WHERE org_id IN (
  SELECT org_id FROM profiles 
  WHERE user_id = '00000000-0000-0000-0000-000000000001'::UUID
);

-- ============================================
-- 警告: RLSを有効化する前に必ず以下を確認してください
-- ============================================
-- 1. バックアップを取得済みである
-- 2. Service Role Keyが環境変数に設定されている
-- 3. アプリケーションがカスタムヘッダーを送信するように更新されている
-- 4. 開発環境で十分にテストされている
-- 
-- RLSを有効化するには、enable_rls_with_clerk.sqlを実行してください
-- ============================================