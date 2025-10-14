# 🔧 簡単な修正手順（3ステップ）

## ステップ1: 現在のポリシーを確認

Supabase SQLエディターで実行：

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'orgs', 'press_machines', 'maintenance_records')
ORDER BY tablename, policyname;
```

## ステップ2: DROP文を自動生成して実行

以下のクエリを実行すると、すべてのポリシーを削除するSQL文が生成されます：

```sql
SELECT 'DROP POLICY IF EXISTS "' || policyname || '" ON ' || tablename || ';'
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'orgs', 'press_machines', 'maintenance_records');
```

**結果をコピーして、新しいクエリとして実行してください。**

例：
```sql
DROP POLICY IF EXISTS "profiles_self" ON profiles;
DROP POLICY IF EXISTS "orgs_select" ON orgs;
...
```

## ステップ3: 型を変更

すべてのポリシーを削除した後、以下を実行：

```sql
-- バックアップ作成
CREATE TABLE IF NOT EXISTS profiles_backup AS
SELECT * FROM profiles;

-- 外部キー制約を削除
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- user_idの型をTEXTに変更
ALTER TABLE profiles
ALTER COLUMN user_id TYPE TEXT;

-- 既存のプロファイルを確認
SELECT user_id, email FROM profiles;

-- UUID形式のIDがある場合は削除
TRUNCATE profiles;

-- 変更を確認
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'user_id';
```

**期待される結果**: `data_type = 'text'`

## ステップ4: RLSを無効化（オプション）

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE orgs DISABLE ROW LEVEL SECURITY;
ALTER TABLE press_machines DISABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records DISABLE ROW LEVEL SECURITY;
```

## ステップ5: アプリケーションでテスト

1. http://localhost:3001 にアクセス
2. ibron1975@gmail.com でログイン
3. メンテナンス記録を作成

**成功の確認**: 開発サーバーのログに以下が表示される
```
✅ プロファイル作成成功: { user_id: 'user_32lUb9bOD1CHFlgG07jsfNAuJUG', ... }
```

## トラブルシューティング

### まだエラーが出る場合

ステップ2で生成されたDROP文をすべて実行したか確認してください。

### 確認方法

```sql
-- ポリシーが残っているか確認
SELECT COUNT(*) as remaining_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'orgs', 'press_machines', 'maintenance_records');
```

**期待される結果**: `remaining_policies = 0`
