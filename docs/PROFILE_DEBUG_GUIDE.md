# プロファイル問題デバッグガイド

## 問題の症状
メンテナンス記録作成時に「ユーザー情報が見つかりません」エラーが表示される。

## 原因
Clerk認証のユーザーIDに対応するSupabase `profiles` テーブルのレコードが存在しない。

## 解決手順

### ステップ1: 開発サーバーのログを確認

開発サーバーのターミナルで以下のログを確認：

```
🔍 getUserPermissions: userId = [Clerk User ID]
❌ プロファイルが見つかりません。userId: [Clerk User ID]
⚠️ プロファイルが存在しないため、自動作成を試みます
📧 User email: [メールアドレス]
🆔 User ID: [Clerk User ID]
🔧 環境変数チェック:
  - NEXT_PUBLIC_DEFAULT_ORG_ID: [組織ID]
  - Email: [メールアドレス]
```

### ステップ2: 環境変数の確認

もし以下のログが表示された場合、環境変数が設定されていません：

```
❌ メールアドレスまたは組織IDが見つかりません
  - Email exists: false
  - OrgId exists: false
```

**解決方法**: `.env.local` ファイルに以下を確認：
```bash
NEXT_PUBLIC_DEFAULT_ORG_ID=c897453e-14c7-4335-bdb4-91978778d95b
```

### ステップ3: 自動作成の結果を確認

#### 成功した場合:
```
✅ プロファイル作成成功: { user_id: '...', email: '...', role: 'admin', ... }
🔄 再度ユーザー権限を取得します
✅ プロファイル取得成功: { email: '...', role: 'admin' }
```

#### 失敗した場合:
```
❌ プロファイル作成エラー: { ... }
  - Error code: [エラーコード]
  - Error message: [エラーメッセージ]
  - Error details: [詳細]
```

## 手動でプロファイルを作成する方法

自動作成が失敗した場合は、Supabaseで手動作成できます。

### 必要な情報
ログから以下の情報を取得：
- **Clerk User ID**: `🆔 User ID:` の値
- **メールアドレス**: `📧 User email:` の値

### SQLクエリ
```sql
-- プロファイルを手動作成
INSERT INTO profiles (user_id, email, full_name, role, org_id, created_at)
VALUES (
  '[Clerk User IDをここに貼り付け]',
  '[メールアドレスをここに貼り付け]',
  '[氏名]',
  'admin',  -- ibron1975@gmail.comとyamamoto@iidzka.co.jpの場合
  'c897453e-14c7-4335-bdb4-91978778d95b',
  NOW()
)
ON CONFLICT (user_id) DO UPDATE
SET
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- 作成されたプロファイルを確認
SELECT * FROM profiles WHERE user_id = '[Clerk User IDをここに貼り付け]';
```

### 管理者メールアドレス
以下のメールアドレスは自動的に `admin` ロールになります：
- ibron1975@gmail.com
- yamamoto@iidzka.co.jp

その他のメールアドレスは `viewer` ロールになります。

## よくある問題と解決方法

### 問題0: UUID型エラー（最優先で修正）

```
Error: invalid input syntax for type uuid: "user_32lUb9bOD1CHFlgG07jsfNAuJUG"
```

**原因**: `profiles`テーブルの`user_id`カラムがUUID型で定義されているが、ClerkのユーザーIDは文字列形式。

**解決方法**: `database/fix_user_id_type.sql` を実行して、`user_id`をTEXT型に変更。

**詳細手順**: `database/FIX_USER_ID_TYPE_GUIDE.md` を参照。

**重要**: これを修正しない限り、プロファイルの作成は不可能です。

### 問題1: RLSエラー
```
Error: new row violates row-level security policy
```

**解決方法**: RLSポリシーを一時的に無効化するか、Service Role Keyを使用する。
コードでは `createAdminSupabaseClient()` を使用しているので、`SUPABASE_SERVICE_ROLE_KEY` 環境変数を確認。

### 問題2: 組織IDが無効
```
Error: insert or update on table "profiles" violates foreign key constraint
```

**解決方法**: `orgs` テーブルに組織レコードが存在するか確認：
```sql
SELECT * FROM orgs WHERE id = 'c897453e-14c7-4335-bdb4-91978778d95b';
```

存在しない場合は作成：
```sql
INSERT INTO orgs (id, name, created_at)
VALUES (
  'c897453e-14c7-4335-bdb4-91978778d95b',
  '飯塚化工',
  NOW()
);
```

### 問題3: 既存のプロファイルがあるがロールが不正
```sql
-- ロールを更新
UPDATE profiles
SET role = 'admin'
WHERE email IN ('ibron1975@gmail.com', 'yamamoto@iidzka.co.jp');

-- 確認
SELECT user_id, email, role FROM profiles WHERE email IN ('ibron1975@gmail.com', 'yamamoto@iidzka.co.jp');
```

## 次のステップ

1. メンテナンス記録の作成を再度試す
2. ログを確認して問題の原因を特定
3. 必要に応じて手動でプロファイルを作成
4. 作成後、再度メンテナンス記録の作成を試す

## デバッグ用SQLクエリ

```sql
-- すべてのプロファイルを確認
SELECT user_id, email, full_name, role, org_id FROM profiles ORDER BY created_at DESC;

-- 特定のメールアドレスを検索
SELECT * FROM profiles WHERE email LIKE '%ibron1975%';

-- adminロールのユーザーを確認
SELECT * FROM profiles WHERE role = 'admin';

-- 組織の確認
SELECT * FROM orgs;
```
