-- ============================================
-- Clerk認証用関数の作成（RLS実装前の準備）
-- ============================================
-- 
-- このスクリプトはRLSポリシーを適用する前に必要な関数を作成します
-- まずこのスクリプトを実行してから、enable_rls_with_clerk.sqlを実行してください

-- ============================================
-- Step 1: 既存の関数を削除（存在する場合）
-- ============================================

DROP FUNCTION IF EXISTS get_clerk_user_id();
DROP FUNCTION IF EXISTS get_clerk_org_id();
DROP FUNCTION IF EXISTS is_service_role();

-- ============================================
-- Step 2: Clerk認証用関数の作成
-- ============================================

-- ClerkユーザーIDを取得する関数
CREATE OR REPLACE FUNCTION get_clerk_user_id()
RETURNS TEXT AS $$
BEGIN
  -- リクエストヘッダーからClerkユーザーIDを取得
  RETURN current_setting('request.headers', true)::json->>'x-clerk-user-id';
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clerk組織IDを取得する関数
CREATE OR REPLACE FUNCTION get_clerk_org_id()
RETURNS TEXT AS $$
BEGIN
  -- リクエストヘッダーからClerk組織IDを取得
  RETURN current_setting('request.headers', true)::json->>'x-clerk-org-id';
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Service Roleかどうかを確認する関数
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  -- JWTクレームからロールを確認
  RETURN current_setting('request.jwt.claims', true)::json->>'role' = 'service_role';
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Step 3: 関数の動作テスト
-- ============================================

-- 関数が作成されたことを確認
SELECT 
  get_clerk_user_id() AS clerk_user_id,
  get_clerk_org_id() AS clerk_org_id,
  is_service_role() AS is_service_role;

-- ============================================
-- 実行後の確認
-- ============================================
-- 1. 上記のSELECTクエリでNULL, NULL, trueが返ることを確認
--    （Service Role Keyで実行するとis_service_role()がtrueになります）
-- 2. エラーなく実行が完了したら、次にenable_rls_with_clerk.sqlを実行
-- ============================================