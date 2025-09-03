# GitHub MCP 連携セットアップガイド

## 📋 GitHub MCP設定手順

### ステップ1: GitHubトークンの作成

1. **GitHub.com にログイン**
   - https://github.com にアクセス
   - 右上のプロフィール画像をクリック

2. **Settings → Developer settings**
   - Settings ページを開く
   - 左サイドバー下部の「Developer settings」をクリック

3. **Personal Access Tokens → Fine-grained tokens**
   - 「Personal access tokens」を展開
   - 「Fine-grained tokens」を選択
   - 「Generate new token」をクリック

4. **トークン設定**
   ```
   Token name: Smart Press Monitor MCP
   Expiration: 90 days（または任意）
   Resource owner: あなたのアカウント
   Repository access: Selected repositories
   Selected repositories: press-machine-db（作成後）
   ```

5. **権限設定（Repository permissions）**
   ```
   Contents: Read and write
   Issues: Read and write  
   Metadata: Read
   Pull requests: Read and write
   ```

6. **トークンを生成・コピー**
   - 「Generate token」をクリック
   - 表示されたトークンを安全にコピー・保存

### ステップ2: MCP設定ファイル更新

MCP設定ファイル（mcp_config.json）にGitHub MCPサーバーを追加：

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:PASSWORD@db.qlsntrswoaxdwrtobunw.supabase.co:5432/postgres"
      ]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_GITHUB_TOKEN_HERE"
      }
    }
  }
}
```

### ステップ3: GitHubリポジトリ作成

1. **新規リポジトリ作成**
   - GitHub.com で「New repository」をクリック
   - Repository name: `smart-press-monitor`
   - Description: `プレス機とメンテナンス記録の統合管理システム`
   - Public または Private を選択
   - ✅ Add a README file（チェック外す）
   - ✅ Add .gitignore（チェック外す） 
   - License: MIT License（推奨）

2. **リポジトリURL取得**
   ```
   HTTPS: https://github.com/YOUR_USERNAME/smart-press-monitor.git
   SSH: git@github.com:YOUR_USERNAME/smart-press-monitor.git
   ```

### ステップ4: ローカルGit設定

```bash
# プロジェクトディレクトリでGit初期化
cd C:\Users\CATIA\Documents\Claude\press_machine_db
git init

# リモートリポジトリ追加
git remote add origin https://github.com/YOUR_USERNAME/smart-press-monitor.git

# ブランチ名設定
git branch -M main

# 最初のコミット
git add .
git commit -m "Initial commit: Smart Press Monitor

🚀 Features:
- Next.js 15 Web application with TypeScript
- Supabase integration for data management
- Press machine and maintenance record management
- Responsive UI with Tailwind CSS and shadcn/ui
- Python desktop application (legacy)

🛠️ Generated with Claude Code
https://claude.ai/code"

# GitHub にプッシュ
git push -u origin main
```

### ステップ5: MCP接続テスト

Claude Desktop でMCP接続後、以下をテスト：

```
# リポジトリ情報確認
GitHub MCP経由でリポジトリ状況を確認

# Issue作成テスト  
新しいIssueを作成してMCP動作を確認

# コミット履歴確認
最近のコミット履歴を取得
```

---

## 🔐 セキュリティ注意事項

### 重要な保護対象
- **GitHubトークン**: 絶対に公開リポジトリにコミットしない
- **mcp_config.json**: `.gitignore`に追加済み
- **Supabase認証情報**: 同様に保護

### トークン管理
- 定期的にトークンをローテーション
- 最小限の権限のみ付与
- 使用しなくなったトークンは削除

---

## 🚀 期待される効果

### 開発効率化
- GitHub操作を Claude から直接実行
- Issue・PR管理の自動化
- コードレビュー支援

### プロジェクト管理  
- リアルタイムなリポジトリ状況把握
- 自動的なドキュメント更新
- 継続的な開発進捗追跡

---

*作成日: 2025年9月3日*  
*用途: GitHub MCP連携によるプロジェクト管理の効率化*