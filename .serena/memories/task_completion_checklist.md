# Task Completion Checklist

## タスク完了時に実行すべきコマンド

### 1. コード品質チェック
```bash
# ESLintによるリンティング
cd press-machine-web && npm run lint

# TypeScriptの型チェック（tsconfig.jsonがある場合）
cd press-machine-web && npx tsc --noEmit
```

### 2. ビルド確認
```bash
# プロダクションビルドの成功確認
cd press-machine-web && npm run build
```

### 3. 動作確認
- 開発サーバーでの動作確認
- 変更した機能の手動テスト
- エラーログの確認

### 4. Git操作（ユーザーが明示的に要求した場合のみ）
```bash
# 変更内容の確認
git status
git diff

# コミット（明示的に要求された場合）
git add .
git commit -m "メッセージ"
```

## 重要な注意事項

### してはいけないこと
- ユーザーの明示的な要求なしにgit commitしない
- 不要な.bakファイルを残さない
- console.logデバッグコードを残さない

### 確認事項
- [ ] ESLintエラーがないか
- [ ] ビルドが成功するか
- [ ] 開発サーバーでエラーが出ていないか
- [ ] 既存機能を壊していないか
- [ ] マルチテナント（org_id）を考慮しているか

## トラブルシューティング
- キャッシュ問題: `rm -rf .next && npm run dev`
- 依存関係問題: `rm -rf node_modules && npm install`
- ポート競合: `netstat -an | findstr :3000`