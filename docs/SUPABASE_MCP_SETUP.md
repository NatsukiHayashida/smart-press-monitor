# Supabase MCP 連携セットアップ

## 📋 現在のSupabase情報

### プロジェクト詳細
- **プロジェクト名**: Smart Press Monitor
- **プロジェクトID**: qlsntrswoaxdwrtobunw
- **URL**: https://qlsntrswoaxdwrtobunw.supabase.co
- **地域**: 不明（通常は us-east-1 または eu-west-1）

### 接続情報
- **Database Host**: db.qlsntrswoaxdwrtobunw.supabase.co
- **Port**: 5432
- **Database Name**: postgres
- **Username**: postgres
- **Password**: [Supabaseダッシュボードで確認必要]

---

## 🔑 必要な設定手順

### ステップ1: Supabaseダッシュボードでパスワード確認

1. https://app.supabase.com にログイン
2. Smart Press Monitor プロジェクトを選択
3. **Settings** → **Database** を開く
4. **Connection string** セクションで以下を確認：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.qlsntrswoaxdwrtobunw.supabase.co:5432/postgres
   ```

### ステップ2: MCP設定ファイル更新

`mcp_config.json` の [password] 部分を実際のパスワードに置換：

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.qlsntrswoaxdwrtobunw.supabase.co:5432/postgres"
      ]
    }
  }
}
```

### ステップ3: 接続テスト用SQLクエリ

MCP接続が成功したら以下のクエリで動作確認：

```sql
-- 1. テーブル一覧確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. orgsテーブル確認
SELECT * FROM orgs;

-- 3. profilesテーブル確認  
SELECT * FROM profiles;

-- 4. press_machinesテーブル確認（件数）
SELECT COUNT(*) FROM press_machines;

-- 5. maintenance_recordsテーブル確認（件数）
SELECT COUNT(*) FROM maintenance_records;
```

---

## 🚨 セキュリティ注意事項

### 重要な注意点
- データベースパスワードは秘密情報です
- mcp_config.json は .gitignore に追加推奨
- 必要に応じてSupabaseのRow Level Security (RLS) を確認

### ファイル保護
```bash
# .gitignore に追加推奨
mcp_config.json
**/mcp_config.json
```

---

## 🔍 トラブルシューティング

### よくある接続エラー
1. **パスワード認証エラー**: Supabaseダッシュボードでパスワード再確認
2. **ホスト接続エラー**: ファイアウォール・ネットワーク設定確認
3. **SSL接続エラー**: SSL証明書の問題（通常は自動解決）

### デバッグ用情報
```bash
# PostgreSQL バージョン確認
SELECT version();

# 現在のユーザー確認
SELECT current_user;

# データベース名確認
SELECT current_database();
```

---

## 📊 期待される結果

MCP接続成功後に確認できるべき内容：

### データベース構造
- **orgs**: 組織情報（現在は空の可能性）
- **profiles**: ユーザープロフィール（認証済みユーザー分）
- **press_machines**: 33台のプレス機データ
- **maintenance_records**: 1件のメンテナンス記録

### データ件数
- press_machines: 33件
- maintenance_records: 1件  
- profiles: 認証したユーザー数
- orgs: 0件（問題の原因）

---

*作成日: 2025年9月3日*
*用途: MCP-Supabase連携によるデータ取得問題の診断・解決*