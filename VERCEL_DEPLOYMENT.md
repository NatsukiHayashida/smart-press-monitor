# Vercel Deployment Guide

## 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定してください：

### 必須環境変数

1. **Vercel Dashboard** にアクセス
2. プロジェクトの **Settings** → **Environment Variables** に移動
3. 以下の変数を追加：

```
NEXT_PUBLIC_SUPABASE_URL=https://qlsntrswoaxdwrtobunw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsc250cnN3b2F4ZHdydG9idW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3OTA5MzQsImV4cCI6MjA3MjM2NjkzNH0.xPyzHzyrlrnB9lG5WdkrjPFnOxdQ_n5nI3fOqnD32Iw
NEXT_PUBLIC_DEFAULT_ORG_ID=c897453e-14c7-4335-bdb4-91978778d95b
```

### 環境変数の適用範囲
- Production
- Preview
- Development

全ての環境に適用することを推奨します。

## デプロイ設定

### Root Directory
プロジェクトのRoot Directoryは **ルート（/）** のままにしてください。
`vercel.json` がサブディレクトリ構造を処理します。

### Framework Preset
**Next.js** を選択

### Build & Output Settings
デフォルト設定のままで問題ありません（vercel.jsonで制御）

## 再デプロイ

環境変数を設定後：
1. **Deployments** タブに移動
2. 最新のデプロイメントの **...** メニューから **Redeploy** を選択
3. **Use existing Build Cache** のチェックを外す
4. **Redeploy** をクリック

## トラブルシューティング

### "Next.js version not detected" エラー
- Root Directoryがルート（/）になっているか確認
- `vercel.json` が正しく設定されているか確認

### 環境変数エラー
- Vercel Dashboardで環境変数が正しく設定されているか確認
- 変数名が正確にコピーされているか確認（タイポに注意）

### ビルドエラー
- ローカルで `cd press-machine-web && npm run build` が成功するか確認
- Node.jsバージョンの互換性を確認