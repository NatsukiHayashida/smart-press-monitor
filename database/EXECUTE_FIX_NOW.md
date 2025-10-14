# 🚨 重要: データベース修正が必要です

## 問題の概要

ClerkユーザーID（`user_32lUb9bOD1CHFlgG07jsfNAuJUG`）を`profiles`テーブルに挿入しようとすると、以下のエラーが発生します：

```
invalid input syntax for type uuid: "user_32lUb9bOD1CHFlgG07jsfNAuJUG"
```

**原因**: `profiles.user_id`カラムがUUID型で定義されているが、ClerkのユーザーIDは文字列形式。

## 🔧 即座に実行する手順

### 📌 簡潔版
より簡単な手順は `database/SIMPLE_FIX_STEPS.md` を参照してください。

### 1. Supabase SQLエディターを開く

https://supabase.com/dashboard → SQL Editor

### 2. ポリシー削除SQL文を生成

まず、現在のポリシーを削除するSQL文を自動生成：

```sql
SELECT 'DROP POLICY IF EXISTS "' || policyname || '" ON ' || tablename || ';'
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'orgs', 'press_machines', 'maintenance_records');
```

**結果をコピーして、新しいクエリとして実行してください。**

### 3. 型変更を実行

すべてのポリシーを削除した後、以下のSQLを実行

```sql
-- ========================================
-- ステップ1: バックアップ作成
-- ========================================
CREATE TABLE IF NOT EXISTS profiles_backup AS
SELECT * FROM profiles;

-- 確認
SELECT COUNT(*) as backup_count FROM profiles_backup;

-- ========================================
-- ステップ2: すべてのテーブルのRLSを一時的に無効化
-- ========================================
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE orgs DISABLE ROW LEVEL SECURITY;
ALTER TABLE press_machines DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records DISABLE ROW LEVEL SECURITY;

-- ========================================
-- ステップ3: すべてのRLSポリシーを削除
-- ========================================
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

-- ========================================
-- ステップ4: 外部キー制約を削除
-- ========================================
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- ========================================
-- ステップ5: user_idの型をTEXTに変更
-- ========================================
ALTER TABLE profiles
ALTER COLUMN user_id TYPE TEXT;

-- ========================================
-- ステップ6: 既存のプロファイルを削除（UUID形式のIDがある場合）
-- ========================================
-- まず確認
SELECT user_id, email FROM profiles;

-- UUID形式のIDがある場合は削除
TRUNCATE profiles;

-- ========================================
-- ステップ7: 変更を確認
-- ========================================
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name = 'user_id';

-- 期待される結果: data_type = 'text'
```

### 3. Webアプリケーションで再テスト

1. ブラウザで http://localhost:3001 にアクセス
2. ibron1975@gmail.com でログイン
3. メンテナンス記録を作成

### 4. 成功の確認

開発サーバーのログに以下が表示されるはずです：

```
✅ プロファイル作成成功: { user_id: 'user_32lUb9bOD1CHFlgG07jsfNAuJUG', email: 'ibron1975@gmail.com', role: 'admin', ... }
```

## 📝 詳細ガイド

より詳しい手順とトラブルシューティングは以下を参照：
- `database/FIX_USER_ID_TYPE_GUIDE.md` - 完全な修正ガイド
- `docs/PROFILE_DEBUG_GUIDE.md` - デバッグ手順

## ⚠️ 注意事項

1. **既存データ**: UUID形式のuser_idを持つプロファイルは削除されます
2. **バックアップ**: 必ずバックアップを作成してから実行してください
3. **本番環境**: 開発環境でテスト後に本番環境で実行してください

## 🎯 期待される結果

修正後：
- ✅ Clerkユーザーが自動的にプロファイルを作成できる
- ✅ メンテナンス記録の作成が成功する
- ✅ 権限チェックが正常に動作する
