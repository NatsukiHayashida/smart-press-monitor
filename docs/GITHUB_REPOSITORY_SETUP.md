# GitHub リポジトリセットアップ手順

## 🚀 リポジトリ作成

### ステップ1: GitHubでリポジトリ作成

1. **GitHub.com にアクセス**
   - https://github.com にログイン
   - 右上の「+」→「New repository」

2. **リポジトリ設定**
   ```
   Repository name: smart-press-monitor
   Description: プレス機とメンテナンス記録の統合管理システム - Next.js + Supabase
   
   ☑️ Public（推奨） または Private
   ☐ Add a README file（チェックしない）
   ☐ Add .gitignore（チェックしない）
   ☐ Choose a license（またはMIT License）
   ```

3. **「Create repository」をクリック**

### ステップ2: ローカルでGit初期化

```bash
# プロジェクトディレクトリに移動
cd C:\Users\CATIA\Documents\Claude\press_machine_db

# Git初期化
git init

# リモートリポジトリ追加（YOUR_USERNAMEを実際のユーザー名に変更）
git remote add origin https://github.com/YOUR_USERNAME/smart-press-monitor.git

# メインブランチに設定
git branch -M main

# 全ファイルをステージング
git add .

# 初期コミット
git commit -m "Initial commit: Smart Press Monitor

🚀 Features:
- Next.js 15 Web application with TypeScript
- Supabase integration for data management  
- Press machine and maintenance record management
- Responsive UI with Tailwind CSS and shadcn/ui
- Python desktop application (legacy)

🛠️ Tech Stack:
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth)
- Tools: Turbopack, ESLint, PostCSS

🔧 Generated with Claude Code
https://claude.ai/code"

# GitHubにプッシュ
git push -u origin main
```

### ステップ3: リポジトリURL確認

作成後のリポジトリURL:
```
https://github.com/YOUR_USERNAME/smart-press-monitor
```

---

## 🔄 MCP接続後の作業

### GitHub MCP経由でできること

1. **リポジトリ操作**
   - ファイル作成・編集・削除
   - コミット・プッシュ
   - ブランチ管理

2. **Issue管理**
   - バグレポート作成
   - 機能要求管理
   - プロジェクト追跡

3. **プルリクエスト**
   - コードレビュー
   - ブランチマージ
   - 自動テスト連携

### 接続テスト用コマンド

MCP接続後、以下で動作確認：

```
1. リポジトリ情報取得
2. 新しいIssue作成（テスト用）
3. README.md更新
4. コミット履歴確認
```

---

## ⚡ 次のステップ

1. **✅ GitHub MCP設定完了** - `mcp_config.json` 更新済み
2. **🔄 Claude Desktop再起動** - MCP設定を反映
3. **🚀 リポジトリ作成** - 上記手順でGitHubリポジトリ作成
4. **📤 初期プッシュ** - プロジェクト全体をGitHubにアップロード
5. **🧪 MCP接続テスト** - GitHub操作の動作確認

---

*MCP設定ファイル更新完了 - Claude Desktop を再起動してMCP接続を有効化してください*