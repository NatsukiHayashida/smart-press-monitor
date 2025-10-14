# user_id型修正ガイド

## 問題の概要

Clerk認証への移行後、`profiles`テーブルの`user_id`カラムがUUID型のままになっており、Clerk認証のユーザーID（文字列形式: `user_XXXXXXXXXX`）と型が合いません。

### エラーメッセージ
```
invalid input syntax for type uuid: "user_32lUb9bOD1CHFlgG07jsfNAuJUG"
```

## 解決方法

`profiles`テーブルの`user_id`カラムをUUID型からTEXT型に変更します。

## 実行手順

### ステップ1: Supabase SQLエディターを開く
1. Supabaseダッシュボードにログイン
2. 左メニューから「SQL Editor」を選択

### ステップ2: 修正スクリプトを実行

`database/fix_user_id_type.sql` の内容をコピーして、SQLエディターに貼り付けます。

または、以下のステップを個別に実行：

#### 2-1. バックアップ作成
```sql
CREATE TABLE IF NOT EXISTS profiles_backup AS
SELECT * FROM profiles;

-- 確認
SELECT COUNT(*) as backup_count FROM profiles_backup;
```

#### 2-2. すべてのテーブルのRLSを一時的に無効化
```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE orgs DISABLE ROW LEVEL SECURITY;
ALTER TABLE press_machines DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records DISABLE ROW LEVEL SECURITY;
```

#### 2-3. すべてのRLSポリシーを削除（重要！）
```sql
-- profilesテーブル
DROP POLICY IF EXISTS profiles_select_own ON profiles;
DROP POLICY IF EXISTS profiles_insert_own ON profiles;
DROP POLICY IF EXISTS profiles_update_own ON profiles;

-- orgsテーブル
DROP POLICY IF EXISTS orgs_select ON orgs;
DROP POLICY IF EXISTS orgs_insert ON orgs;
DROP POLICY IF EXISTS orgs_update ON orgs;
DROP POLICY IF EXISTS orgs_delete ON orgs;

-- press_machinesテーブル
DROP POLICY IF EXISTS press_machines_select ON press_machines;
DROP POLICY IF EXISTS press_machines_insert ON press_machines;
DROP POLICY IF EXISTS press_machines_update ON press_machines;
DROP POLICY IF EXISTS press_machines_delete ON press_machines;

-- maintenance_recordsテーブル
DROP POLICY IF EXISTS maintenance_records_select ON maintenance_records;
DROP POLICY IF EXISTS maintenance_records_insert ON maintenance_records;
DROP POLICY IF EXISTS maintenance_records_update ON maintenance_records;
DROP POLICY IF EXISTS maintenance_records_delete ON maintenance_records;
```

#### 2-4. 外部キー制約を削除
```sql
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
```

#### 2-5. カラムの型を変更
```sql
ALTER TABLE profiles
ALTER COLUMN user_id TYPE TEXT;
```

#### 2-6. 変更を確認
```sql
SELECT
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name = 'user_id';
```

**期待される結果**:
```
column_name | data_type | character_maximum_length
user_id     | text      | null
```

### ステップ3: 既存のプロファイルを削除（必要な場合）

もし既存のプロファイルがUUID形式のIDを持っている場合、削除します：

```sql
-- 既存のプロファイルを確認
SELECT * FROM profiles;

-- すべて削除する場合（注意: 削除前にバックアップ確認）
TRUNCATE profiles;
```

### ステップ4: Webアプリケーションで動作確認

1. ブラウザで http://localhost:3001 にアクセス
2. ibron1975@gmail.com でログイン
3. メンテナンス記録を作成

### ステップ5: ログを確認

開発サーバーのターミナルで以下のログを確認：

**成功した場合**:
```
🔍 getUserPermissions: userId = user_32lUb9bOD1CHFlgG07jsfNAuJUG
⚠️ プロファイルが存在しないため、自動作成を試みます
📧 User email: ibron1975@gmail.com
🆔 User ID: user_32lUb9bOD1CHFlgG07jsfNAuJUG
📝 プロファイルを作成中: { ... }
✅ プロファイル作成成功: { ... }
```

## トラブルシューティング

### 問題1: バックアップテーブルが既に存在する

```sql
DROP TABLE IF EXISTS profiles_backup;
```

その後、再度バックアップを作成。

### 問題2: 既存のデータがある

```sql
-- 既存のプロファイルを確認
SELECT user_id, email, full_name FROM profiles;

-- UUID形式のIDがある場合、削除またはマイグレーション
-- 注意: 既存のユーザーデータは失われます
TRUNCATE profiles;
```

### 問題3: 外部キー制約が残っている

```sql
-- すべての外部キー制約を確認
SELECT
  constraint_name,
  table_name,
  column_name
FROM information_schema.key_column_usage
WHERE table_name = 'profiles';

-- 必要に応じて削除
ALTER TABLE profiles
DROP CONSTRAINT [constraint_name];
```

## 重要な注意事項

1. **データのバックアップ**: 必ずバックアップを作成してから実行してください
2. **既存ユーザー**: 既存のUUID形式のuser_idを持つプロファイルは削除する必要があります
3. **認証システム**: Clerk認証を使用している場合のみこの修正を実行してください
4. **本番環境**: 本番環境で実行する前に、開発環境で十分にテストしてください

## データベーススキーマの更新

`database/supabase_schema.sql` も更新する必要があります：

```sql
-- 変更前:
user_id uuid primary key references auth.users(id) on delete cascade,

-- 変更後:
user_id text primary key,
```

## 次のステップ

型変更が完了したら、以下のテストを実行：
1. ユーザー登録とプロファイル自動作成
2. メンテナンス記録の作成・編集・削除
3. プレス機の作成・編集・削除
4. 権限チェック（admin vs viewer）
