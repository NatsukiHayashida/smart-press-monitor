# Suggested Commands for Press Machine DB Project

## 開発コマンド
```bash
# 開発サーバー起動
cd press-machine-web && npm run dev

# プロダクションビルド
cd press-machine-web && npm run build

# プロダクションサーバー起動
cd press-machine-web && npm run start

# リンティング実行
cd press-machine-web && npm run lint

# 依存関係インストール
cd press-machine-web && npm install
```

## Git操作
```bash
# 現在のステータス確認
git status

# 変更内容確認
git diff

# コミット履歴確認
git log --oneline -10

# 現在のブランチ
git branch
```

## ファイル操作 (Windows)
```bash
# ディレクトリ一覧
ls -la
dir

# ファイル内容表示
cat [file]
type [file]

# ファイル検索
find . -name "*.ts"

# テキスト検索
grep -r "pattern" .
```

## Supabaseデータベース
```bash
# TypeScript型生成（要PROJECT_ID）
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

## プロセス管理
```bash
# ポート使用確認
netstat -an | findstr :3000

# プロセス確認
tasklist | findstr node

# プロセス終了
taskkill /F /PID [pid]
```

## 環境変数確認
```bash
# .env.localファイル確認
cat press-machine-web/.env.local
```