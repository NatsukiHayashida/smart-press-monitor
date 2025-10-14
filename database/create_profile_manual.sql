-- 手動プロファイル作成スクリプト
-- 使用前に以下の情報をログから取得してください：
-- - Clerk User ID (🆔 User ID: の値)
-- - メールアドレス (📧 User email: の値)

-- ========================================
-- ステップ1: 組織が存在するか確認
-- ========================================
SELECT * FROM orgs WHERE id = 'c897453e-14c7-4335-bdb4-91978778d95b';

-- もし組織が存在しない場合は作成:
INSERT INTO orgs (id, name, created_at)
VALUES (
  'c897453e-14c7-4335-bdb4-91978778d95b',
  '飯塚化工',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- ステップ2: プロファイルを作成
-- ========================================
-- 【重要】以下の [CLERK_USER_ID] と [EMAIL] を実際の値に置き換えてください

-- ibron1975@gmail.com の場合:
INSERT INTO profiles (user_id, email, full_name, role, org_id, created_at)
VALUES (
  '[CLERK_USER_ID]',  -- ← ログから取得したClerk User IDに置き換え
  'ibron1975@gmail.com',
  'ibron',
  'admin',
  'c897453e-14c7-4335-bdb4-91978778d95b',
  NOW()
)
ON CONFLICT (user_id) DO UPDATE
SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  org_id = EXCLUDED.org_id;

-- yamamoto@iidzka.co.jp の場合:
-- INSERT INTO profiles (user_id, email, full_name, role, org_id, created_at)
-- VALUES (
--   '[CLERK_USER_ID]',  -- ← ログから取得したClerk User IDに置き換え
--   'yamamoto@iidzka.co.jp',
--   '山本',
--   'admin',
--   'c897453e-14c7-4335-bdb4-91978778d95b',
--   NOW()
-- )
-- ON CONFLICT (user_id) DO UPDATE
-- SET
--   email = EXCLUDED.email,
--   role = EXCLUDED.role,
--   org_id = EXCLUDED.org_id;

-- その他のユーザーの場合（viewerロール）:
-- INSERT INTO profiles (user_id, email, full_name, role, org_id, created_at)
-- VALUES (
--   '[CLERK_USER_ID]',  -- ← ログから取得したClerk User IDに置き換え
--   '[EMAIL]',  -- ← 実際のメールアドレスに置き換え
--   '[FULL_NAME]',  -- ← 氏名に置き換え
--   'viewer',
--   'c897453e-14c7-4335-bdb4-91978778d95b',
--   NOW()
-- )
-- ON CONFLICT (user_id) DO UPDATE
-- SET
--   email = EXCLUDED.email,
--   role = EXCLUDED.role,
--   org_id = EXCLUDED.org_id;

-- ========================================
-- ステップ3: 作成したプロファイルを確認
-- ========================================
SELECT
  user_id,
  email,
  full_name,
  role,
  org_id,
  created_at
FROM profiles
WHERE user_id = '[CLERK_USER_ID]';  -- ← 実際のClerk User IDに置き換え

-- すべてのプロファイルを確認:
SELECT
  user_id,
  email,
  full_name,
  role,
  org_id,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- adminロールのユーザーを確認:
SELECT
  user_id,
  email,
  full_name,
  role
FROM profiles
WHERE role = 'admin';
