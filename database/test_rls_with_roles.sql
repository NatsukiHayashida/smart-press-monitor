-- RLS権限テスト用SQL
-- このスクリプトで権限ベースのアクセス制御をテストします

-- ===========================
-- テスト準備
-- ===========================

-- テスト用組織がない場合は作成
INSERT INTO orgs (id, name, created_at)
VALUES ('c897453e-14c7-4335-bdb4-91978778d95b', 'テスト組織', NOW())
ON CONFLICT (id) DO NOTHING;

-- テストユーザーの作成（存在しない場合）
-- 1. 管理者ユーザー（ibron1975@gmail.com）
INSERT INTO profiles (user_id, org_id, email, full_name, role, created_at)
VALUES (
  'user_test_admin_001',
  'c897453e-14c7-4335-bdb4-91978778d95b',
  'ibron1975@gmail.com',
  '管理者テストユーザー1',
  'admin',
  NOW()
)
ON CONFLICT (user_id) DO UPDATE
SET role = 'admin', email = 'ibron1975@gmail.com';

-- 2. 管理者ユーザー（yamamoto@iidzka.co.jp）
INSERT INTO profiles (user_id, org_id, email, full_name, role, created_at)
VALUES (
  'user_test_admin_002',
  'c897453e-14c7-4335-bdb4-91978778d95b',
  'yamamoto@iidzka.co.jp',
  '管理者テストユーザー2',
  'admin',
  NOW()
)
ON CONFLICT (user_id) DO UPDATE
SET role = 'admin', email = 'yamamoto@iidzka.co.jp';

-- 3. 一般ユーザー（閲覧のみ）
INSERT INTO profiles (user_id, org_id, email, full_name, role, created_at)
VALUES (
  'user_test_viewer_001',
  'c897453e-14c7-4335-bdb4-91978778d95b',
  'viewer@example.com',
  '閲覧ユーザー',
  'viewer',
  NOW()
)
ON CONFLICT (user_id) DO UPDATE
SET role = 'viewer', email = 'viewer@example.com';

-- 4. 別組織のユーザー
INSERT INTO orgs (id, name, created_at)
VALUES ('d897453e-14c7-4335-bdb4-91978778d95c', '別の組織', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (user_id, org_id, email, full_name, role, created_at)
VALUES (
  'user_test_other_org',
  'd897453e-14c7-4335-bdb4-91978778d95c',
  'other@example.com',
  '別組織ユーザー',
  'admin',
  NOW()
)
ON CONFLICT (user_id) DO NOTHING;

-- ===========================
-- 現在の状態確認
-- ===========================

RAISE NOTICE '=== RLS状態確認 ===';

SELECT
  schemaname,
  tablename,
  CASE WHEN rowsecurity THEN '有効' ELSE '無効' END as "RLS"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'press_machines', 'maintenance_records')
ORDER BY tablename;

RAISE NOTICE '=== ユーザーロール確認 ===';

SELECT
  user_id,
  email,
  role,
  org_id
FROM profiles
ORDER BY role DESC, email;

-- ===========================
-- テストケース
-- ===========================

RAISE NOTICE '=== テストケース開始 ===';

-- テスト1: ヘルパー関数のテスト
RAISE NOTICE 'テスト1: ヘルパー関数';

-- ユーザーIDを設定してテスト
SET LOCAL request.jwt.claims = '{"sub": "user_test_admin_001"}';
SELECT
  'admin権限確認' as test_name,
  auth.clerk_user_id() as user_id,
  auth.get_user_role() as role,
  auth.is_admin() as is_admin;

SET LOCAL request.jwt.claims = '{"sub": "user_test_viewer_001"}';
SELECT
  'viewer権限確認' as test_name,
  auth.clerk_user_id() as user_id,
  auth.get_user_role() as role,
  auth.is_admin() as is_admin;

-- テスト2: 閲覧権限のテスト
RAISE NOTICE 'テスト2: 閲覧権限';

-- 管理者として閲覧
SET LOCAL request.jwt.claims = '{"sub": "user_test_admin_001"}';
SELECT
  '管理者: press_machines閲覧' as test_name,
  COUNT(*) as visible_count
FROM press_machines;

-- 閲覧ユーザーとして閲覧
SET LOCAL request.jwt.claims = '{"sub": "user_test_viewer_001"}';
SELECT
  '閲覧ユーザー: press_machines閲覧' as test_name,
  COUNT(*) as visible_count
FROM press_machines;

-- 別組織ユーザーとして閲覧（0件になるべき）
SET LOCAL request.jwt.claims = '{"sub": "user_test_other_org"}';
SELECT
  '別組織ユーザー: press_machines閲覧' as test_name,
  COUNT(*) as visible_count
FROM press_machines;

-- ===========================
-- 手動テスト用ガイド
-- ===========================

/*

## 手動テスト手順

### 1. 管理者権限テスト（ibron1975@gmail.com でログイン）
- [ ] プレス機一覧が表示される
- [ ] プレス機を新規作成できる
- [ ] プレス機を編集できる
- [ ] プレス機を削除できる
- [ ] メンテナンス記録を新規作成できる
- [ ] メンテナンス記録を編集できる
- [ ] メンテナンス記録を削除できる

### 2. 管理者権限テスト（yamamoto@iidzka.co.jp でログイン）
- [ ] プレス機一覧が表示される
- [ ] プレス機を新規作成できる
- [ ] プレス機を編集できる
- [ ] プレス機を削除できる
- [ ] メンテナンス記録を新規作成できる
- [ ] メンテナンス記録を編集できる
- [ ] メンテナンス記録を削除できる

### 3. 閲覧ユーザー権限テスト（その他のユーザーでログイン）
- [ ] プレス機一覧が表示される（閲覧のみ）
- [ ] プレス機の新規作成ボタンが表示されない/機能しない
- [ ] プレス機の編集ボタンが表示されない/機能しない
- [ ] プレス機の削除ボタンが表示されない/機能しない
- [ ] メンテナンス記録の新規作成ボタンが表示されない/機能しない
- [ ] メンテナンス記録の編集ボタンが表示されない/機能しない
- [ ] メンテナンス記録の削除ボタンが表示されない/機能しない

### 4. エラーメッセージ確認
- [ ] 閲覧ユーザーが編集を試みた場合、適切なエラーメッセージが表示される
- [ ] データベースエラーではなく、権限エラーとして扱われる

### 5. ブラウザコンソール確認
- [ ] 権限エラーが適切にログ出力される
- [ ] RLSポリシー違反のエラーが表示される

## トラブルシューティング

### 閲覧ユーザーでも編集できてしまう場合
1. RLSが正しく有効化されているか確認
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables
   WHERE tablename IN ('press_machines', 'maintenance_records');
   ```

2. ユーザーのロールが正しく設定されているか確認
   ```sql
   SELECT email, role FROM profiles;
   ```

3. ポリシーが正しく作成されているか確認
   ```sql
   SELECT tablename, policyname, cmd FROM pg_policies
   WHERE tablename IN ('press_machines', 'maintenance_records');
   ```

### 管理者でも編集できない場合
1. auth.is_admin()関数が正しく動作しているか確認
   ```sql
   SELECT auth.clerk_user_id(), auth.get_user_role(), auth.is_admin();
   ```

2. Clerkのユーザー情報がSupabaseに正しく渡されているか確認
   - ブラウザの開発者ツールでネットワークタブを確認
   - Supabaseのリクエストヘッダーを確認

*/
