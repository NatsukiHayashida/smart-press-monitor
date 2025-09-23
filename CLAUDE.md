# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

### 開発
```bash
# まずWebアプリケーションディレクトリに移動
cd press-machine-web

# 開発サーバーを起動（動的ポート割り当て）
npm run dev

# 本番用ビルド
npm run build

# 本番サーバーを起動
npm run start

# リンティングを実行
npm run lint

# 依存関係のインストール
npm install

# shadcn/uiコンポーネントのインストール
npx shadcn@latest add [component-name] --overwrite
```

### データベース
```bash
# SupabaseスキーマからTypeScript型を生成
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts

# データベーススキーマファイルの場所
# database/supabase_schema.sql - メインスキーマ
# database/sample_data.sql - サンプルデータ
```

### MCPツール管理
```bash
# MCPサーバーの状態確認
claude mcp list

# 利用可能なMCPサーバー:
# - serena: 高度なコード検索・編集・リファクタリング
# - context7: 最新ライブラリドキュメント参照 (プロンプトに "use context7" を追加)
# - playwright: ブラウザ自動化・E2Eテスト・Web操作
# - shadcn: shadcn/uiコンポーネントの検索・インストール・管理

# MCPサーバーの再起動
claude mcp restart [server_name]
```

### プロジェクト構造操作
```bash
# 整理されたフォルダ構造:
# database/    - SQLスキーマとマイグレーション
# docs/        - プロジェクトドキュメント
# python/      - レガシーPythonコードとユーティリティ
# scripts/     - JavaScriptユーティリティスクリプト
# config/      - 設定ファイル
```

## アーキテクチャ概要

これは、レガシーのPython/Tkinterデスクトップアプリから移行している**Next.js 15 Webアプリケーション**です。以下の技術で構築されたマルチテナント型プレス機管理システムです：

- **フロントエンド**: Next.js 15 App Router、React 19、TypeScript、Tailwind CSS v4、shadcn/ui
- **認証**: Clerk認証（2025年1月に移行完了）
- **データベース**: Supabase（PostgreSQL、リアルタイム機能）
- **フォーム**: React Hook Form + Zodバリデーション
- **通知**: Sonner（トースト通知）

### 主要なアーキテクチャ決定事項

1. **マルチテナントアーキテクチャ**: Row Level Security (RLS)ポリシーを使用して、すべてのデータを組織ごとに分離。すべてのテーブルに`orgs`テーブルを参照する`org_id`カラムがある。（現在RLSは一時的に無効化中）

2. **認証フロー**:
   - Clerk認証を使用（Supabase Authから移行済み）
   - ClerkProviderがアプリ全体をラップ
   - AuthProvider (src/components/auth/AuthProvider.tsx)が認証状態を管理
   - ユーザーはデータにアクセスするために組織に所属する必要がある

3. **データベーススキーマ**:
   - `orgs`: マルチテナンシー用の組織
   - `profiles`: auth.usersにリンクされたユーザープロファイル
   - `press_machines`: 詳細な仕様を持つ機械レコード
   - `maintenance_records`: 機械にリンクされたメンテナンス履歴

4. **コンポーネント構成**:
   - 機能ベースの構造（machines/、maintenance/、auth/）
   - components/ui/内の共有UIコンポーネント（shadcn/ui）
   - types/database.ts内の型定義（Supabaseから自動生成）

### 重要なファイル

- **Supabaseクライアント**: `press-machine-web/src/lib/supabase-clerk.ts` - Clerk統合Supabaseクライアント（必ずこれを使用）
- **データベース型**: `press-machine-web/src/types/database.ts` - 型安全なクエリ用の生成型
- **認証プロバイダー**: `press-machine-web/src/components/auth/AuthProvider.tsx` - 認証状態を管理
- **生産グループ**: `press-machine-web/src/lib/productionGroups.ts` - 機械分類のビジネスロジック
- **ミドルウェア**: `press-machine-web/src/middleware.ts` - Clerk認証のルート保護（最適化済み）
- **パフォーマンス計測**: `press-machine-web/src/lib/timing.ts` - 計測ヘルパー、SLO監視
- **ダッシュボードライブラリ**: `press-machine-web/src/lib/dashboard.ts` - 直接呼び出し用（HTTPオーバーヘッド削減）
- **データベースインデックス**: `database/performance_indexes.sql` - パフォーマンス向上用インデックス

### 開発ガイドライン

1. **Webアプリケーションの変更は必ず`press-machine-web`ディレクトリで作業**
2. **すべてのデータベース操作にはClerk統合Supabaseクライアント**（lib/supabase-clerk.tsの`useSupabaseClient()`）を使用
3. **フォームには既存のパターンに従う**: React Hook Form + Zodスキーマ
4. **日本語UIを維持** - すべてのユーザー向けテキストは日本語にする
5. **マルチテナンシーを尊重** - クエリでは必ずorg_idでフィルタリング
6. **一貫性のためにcomponents/ui/のshadcn/uiコンポーネントを使用**
7. **トースト通知にはSonnerを使用** - `toast.success()`, `toast.error()`など
8. **パフォーマンス重視** - N+1クエリを避け、Promise.allで並列化、必要最小限のカラムを取得
9. **計測の実装** - 重要な処理には`withTiming()`を使用してパフォーマンス監視

### 共通パターン

#### データベースクエリパターン
```typescript
// Supabaseクライアントの取得
const supabase = useSupabaseClient()

// データ取得
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('org_id', orgId)  // 必ず組織でフィルタリング
```

#### フォームパターン
```typescript
// 1. Zodスキーマを定義
const schema = z.object({ ... })
// 2. zodResolverでReact Hook Formを使用
const form = useForm({ resolver: zodResolver(schema) })
// 3. shadcn/uiフォームコンポーネントを使用
```

#### 削除確認パターン（AlertDialog使用）
```typescript
// AlertDialogで確認ダイアログを表示
<AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>確認</AlertDialogTitle>
      <AlertDialogDescription asChild>
        <div>削除対象の詳細情報を表示</div>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>キャンセル</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### パフォーマンス計測パターン
```typescript
import { withTiming, PerformanceMetrics } from '@/lib/timing'

// 非同期処理の計測（10%サンプリング）
const result = await withTiming('DB Query', async () => {
  return supabase.from('table').select('*')
}, 0.1)

// SLO監視（400ms目標）
const duration = performance.now() - startTime
if (duration > 400) {
  console.warn(`⚠️ SLO exceeded: ${duration}ms`)
}
```

#### 高速化クエリパターン
```typescript
// ❌ N+1クエリ（避ける）
for (const record of records) {
  const machine = await supabase
    .from('press_machines')
    .select('machine_number')
    .eq('id', record.press_id)
}

// ✅ 一括取得
const pressIds = records.map(r => r.press_id)
const { data: machines } = await supabase
  .from('press_machines')
  .select('id, machine_number')
  .in('id', pressIds)
```

### MCPツールの活用

このプロジェクトでは以下のMCPツールが統合されています：

1. **Serena** (`/.serena/project.yml`で設定済み)
   - TypeScript/JavaScript/Python/SQLのセマンティック検索
   - Next.js、Supabase、shadcn/ui用に最適化済み
   - 複雑なリファクタリングや横断的変更に使用

2. **Context7**
   - プロンプトに`use context7`を追加して最新ドキュメント参照
   - Next.js 15、React 19、Supabaseの最新情報を取得

3. **Playwright MCP**
   - Web UIの自動テスト・検証
   - フォーム操作やナビゲーションの動作確認
   - E2Eテストシナリオの実行

4. **shadcn/ui MCP**
   - shadcn/uiコンポーネントの検索・参照
   - 自然言語でのコンポーネントインストール
   - 複数レジストリからのコンポーネント取得

### 既知の問題と解決策

1. **Supabase JOINクエリ**: 複雑なJOINの代わりに適切なRLSポリシーを使用
2. **useSearchParams**: クライアントコンポーネントではSuspenseバウンダリでラップする必要がある
3. **認証ローディング状態**: AuthProviderから`loading`と`session`の両方をチェック

### プロジェクト固有の設定

- **ファイル整理**: 種別ごとにフォルダ分けされた構造（database/, docs/, python/, scripts/, config/）
- **日本語UI**: すべてのユーザー向けテキストは日本語で統一
- **Serena設定**: `.serena/project.yml`でプロジェクト固有の言語・除外設定を定義
- **MCP統合**: 3つのMCPサーバーが開発・テスト・ドキュメント参照をサポート

### 環境変数

`.env.local`に必要：
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk公開キー
- `CLERK_SECRET_KEY` - Clerkシークレットキー
- `NEXT_PUBLIC_SUPABASE_URL` - SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase匿名キー
- `SUPABASE_SERVICE_ROLE_KEY` - Admin権限用（パフォーマンス最適化API用）
- `NEXT_PUBLIC_DEFAULT_ORG_ID` - デフォルト組織ID（UUID形式）

### パフォーマンス監視

#### SLO（Service Level Objective）
- **ダッシュボードAPI**: ≤ 400ms（目標）
- **一般ページ**: ≤ 2秒（初回読み込み）
- **ブラウザコンソール**で計測ログを確認
- **Network > Server-Timing**ヘッダーで詳細確認

## 最近の主要な変更

### 2025-01-23: パフォーマンス最適化とメンテナンス機能拡張
- **ダッシュボードAPI大幅高速化**：N+1クエリ解消、並列化により50%以上の速度向上
- **パフォーマンス計測システム**：SLO（400ms）監視、Server-Timingヘッダー
- **メンテナンス記録削除機能**：確認ダイアログ付きの安全な削除機能
- **Sonnerトースト通知**：成功/エラー時の視覚的フィードバック

### 2025-01-16: Clerk認証への移行
- Supabase AuthからClerk認証への完全移行
- すべての認証関連コンポーネントの更新
- ミドルウェアの実装（clerkMiddleware）
- 旧認証ファイルの無効化（.bakファイルとして保持）

## 既知の課題

1. **RLSポリシー**: セキュリティ向上のため再有効化が必要
2. **maintenance_schedulesテーブル**: 未実装（コメントアウト中）
3. **TypeScriptの型安全性**: 一部で`any`型使用（改善予定）
4. **ESLintエラー**: 約80件の警告・エラー（段階的に修正中）
5. **alert-dialogコンポーネント**: 時々Module not found エラー（開発環境のみ）

## パフォーマンス最適化済み項目

✅ **実装済み**：
- N+1クエリの解消（一括取得パターン）
- Promise.allによる並列化
- 必要最小限カラムの取得
- Server-Timingヘッダー
- SLO監視（400ms）
- ミドルウェア最適化

🔄 **次期実装候補**：
- データベース側集計（GROUP BY、RPC）
- ISR（Incremental Static Regeneration）
- レスポンスキャッシュ
- CDN最適化

## トラブルシューティング

### よくあるエラーと対処法

1. **"Module not found" エラー**
   ```bash
   # shadcn/uiコンポーネントが見つからない場合
   npx shadcn@latest add [component-name] --overwrite
   ```

2. **キャッシュエラー**
   ```bash
   # Next.jsキャッシュをクリア
   rm -rf .next
   rm -rf node_modules/.cache
   npm run dev
   ```

3. **ポート競合**
   ```bash
   # ポート3000が使用中の場合は別のポートで起動
   # 開発サーバーが自動的に3001等を使用
   ```

4. **認証エラー**
   - Clerk環境変数を確認
   - org_idが正しく設定されているか確認
   - AuthProviderが正しくラップされているか確認