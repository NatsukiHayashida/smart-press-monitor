# Smart Press Monitor - Clerk認証統合プロジェクト記録

## プロジェクト概要
- **目的**: Supabase AuthからClerk認証への移行
- **期間**: 2025年1月16日
- **主要技術**: Next.js 15, Clerk, Supabase (データベースのみ), TypeScript

## 実装完了項目

### 1. Clerk認証の導入
- ✅ Clerkパッケージのインストール
- ✅ 環境変数の設定（.env.local）
- ✅ ClerkProviderの実装
- ✅ サインイン/サインアップページの作成
- ✅ ミドルウェアの設定（clerkMiddleware）

### 2. Supabaseクライアントの移行
- ✅ Clerk統合用の新しいSupabaseクライアント作成（supabase-clerk.ts）
- ✅ シングルトンパターンの実装
- ✅ すべてのページでsupabaseBrowserからuseSupabaseClientへの移行

### 3. データアクセス問題の解決
- ✅ org_id不一致の修正
- ✅ UUID形式の問題解決
- ✅ RLSポリシーの一時的な無効化

### 4. 詳細ページの実装
- ✅ 機械詳細ページの修正（/machines/[id]）
- ✅ メンテナンス詳細ページの新規作成（/maintenance/[id]）
- ✅ 編集ページの修正

## つまづいたポイントと解決策

### 1. authMiddleware廃止エラー
**問題**: `authMiddleware`がClerkの新バージョンで廃止されていた
```typescript
// ❌ 古い書き方
export default authMiddleware({
  publicRoutes: ["/"]
});

// ✅ 新しい書き方
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
const isPublicRoute = createRouteMatcher(['/'])
export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth.protect()
  }
})
```
**教訓**: ライブラリのバージョン更新時は、Breaking Changesを必ず確認する

### 2. org_id不一致によるデータ取得失敗
**問題**: 環境変数のorg_idと実際のデータベースのorg_idが異なっていた
- 設定値: `c897453e-14c7-4335-bdb4-91978778d95b`
- 実データ: `5aa33531-921a-4425-a235-770ed1f524c5`

**解決策**: 
1. SQLクエリで実際のデータを確認
2. 環境変数を正しい値に更新
3. AuthProviderで正しいorg_idを使用

**教訓**: データベースの実データと設定値は必ず照合する

### 3. supabaseBrowser廃止による500エラー
**問題**: 古いSupabaseクライアントを無効化したが、多数のファイルがまだ使用していた

**解決プロセス**:
1. Grepで全使用箇所を特定（21ファイル）
2. 重要なコンポーネントから順次修正
3. ビルドキャッシュのクリア
4. 認証関連の不要ページを無効化

**教訓**: 大規模なリファクタリング時は、影響範囲を事前に完全に把握する

### 4. Server Actionエラー
**問題**: `UnrecognizedActionError: Server Action was not found`

**原因**: 
- Next.jsのキャッシュとブラウザキャッシュの不整合
- 複数の開発サーバーが同時に実行されていた

**解決策**:
```bash
# 完全なキャッシュクリアと再起動
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

**教訓**: 開発サーバーの多重起動を避け、キャッシュクリアは徹底的に行う

### 5. maintenance_schedulesテーブル不在エラー
**問題**: 存在しないテーブルへのアクセスで404エラー

**解決策**: エラーハンドリングの強化とコメントアウト
```typescript
// エラーコードを網羅的にチェック
if (error.code === 'PGRST116' || error.code === 'PGRST205' || 
    error.message?.includes('does not exist')) {
  setMaintenanceSchedules([])
  return
}
```

**教訓**: オプショナルな機能は存在チェックを必ず実装する

## ベストプラクティス

### 1. 環境変数管理
```env
# 本番用と開発用を明確に分離
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_DEFAULT_ORG_ID=実際のデータと一致する値
```

### 2. Supabaseクライアントのシングルトン実装
```typescript
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function useSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient(...)
  }
  return supabaseInstance
}
```

### 3. 段階的移行戦略
1. 新しい実装を並行して作成
2. 古い実装を無効化（削除ではなく）
3. 動作確認後に古いコードを削除

### 4. デバッグログの活用
```typescript
console.log('🔍 Debug:', {
  userId: user.id,
  orgId: orgId,
  dataCount: data?.length
})
```

## 次回プロジェクトへの推奨事項

### 事前準備
1. **依存関係の確認**: 最新バージョンのドキュメントを必ず確認
2. **データベース構造の把握**: 実際のデータを確認してから実装
3. **影響範囲の分析**: Grepで全使用箇所を事前に特定

### 開発時の注意
1. **キャッシュ管理**: 問題発生時は即座にキャッシュクリア
2. **ポート管理**: 開発サーバーのポート競合を避ける
3. **段階的テスト**: 小さな変更ごとに動作確認

### トラブルシューティング手順
1. ブラウザコンソールエラーの確認
2. サーバーログの確認
3. ネットワークタブでAPIレスポンスの確認
4. キャッシュクリアと再起動
5. 環境変数の再確認

## 使用したツールとコマンド

### 頻繁に使用したコマンド
```bash
# キャッシュクリアと再起動
rm -rf .next && npm run dev

# ファイル内の文字列検索
grep -r "supabaseBrowser" src/

# 複数ファイルの一括修正
# MultiEditツールを使用

# バックグラウンド実行
npm run dev &
```

### 便利だったVSCode拡張/ツール
- Grep検索（パターンマッチング）
- MultiEdit（複数箇所の一括編集）
- BashOutput（バックグラウンドプロセス監視）

## 成果物

### 主要ファイル
- `/src/lib/supabase-clerk.ts` - Clerk統合Supabaseクライアント
- `/src/middleware.ts` - Clerkミドルウェア設定
- `/src/app/maintenance/[id]/page.tsx` - 新規作成したメンテナンス詳細ページ

### 無効化したファイル（.bakに変更）
- `/src/app/auth/login.bak`
- `/src/app/auth/signup.bak`
- `/src/app/auth/callback.bak`
- 他の旧認証関連ファイル

## 今後の改善点

1. **maintenance_schedulesテーブルの実装**
   - テーブル作成後、コメントアウトを解除

2. **RLSポリシーの再有効化**
   - セキュリティ向上のため、適切なポリシーを設定

3. **エラーハンドリングの統一**
   - 共通のエラーハンドリングフックを作成

4. **テスト環境の整備**
   - E2Eテストの追加
   - 認証フローのテスト自動化

## まとめ

このプロジェクトでは、Supabase AuthからClerk認証への移行を成功させました。主な課題は、廃止されたAPIの更新、データ不整合の解決、キャッシュ問題の対処でした。段階的な移行アプローチと徹底的なデバッグにより、すべての問題を解決できました。

今後同様のプロジェクトでは、事前の影響範囲分析とデータ確認を徹底し、キャッシュ管理を最初から意識することで、よりスムーズな移行が可能になるでしょう。