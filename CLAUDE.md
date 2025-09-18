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
- **バックエンド**: Supabase（RLS付きPostgreSQL、認証、リアルタイム）
- **フォーム**: React Hook Form + Zodバリデーション

### 主要なアーキテクチャ決定事項

1. **マルチテナントアーキテクチャ**: Row Level Security (RLS)ポリシーを使用して、すべてのデータを組織ごとに分離。すべてのテーブルに`orgs`テーブルを参照する`org_id`カラムがある。

2. **認証フロー**: 
   - Supabaseマジックリンク認証（メールベース）を使用
   - AuthProvider (src/components/auth/AuthProvider.tsx)が認証状態を管理
   - 初回ログイン時にプロファイルが自動作成される
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

- **Supabaseクライアント**: `press-machine-web/src/lib/supabase/client.ts` - データベース操作には必ずこれを使用
- **データベース型**: `press-machine-web/src/types/database.ts` - 型安全なクエリ用の生成型
- **認証プロバイダー**: `press-machine-web/src/components/auth/AuthProvider.tsx` - 認証状態を管理
- **生産グループ**: `press-machine-web/src/lib/productionGroups.ts` - 機械分類のビジネスロジック

### 開発ガイドライン

1. **Webアプリケーションの変更は必ず`press-machine-web`ディレクトリで作業**
2. **すべてのデータベース操作には既存のSupabaseクライアント**（lib/supabase/client.tsの`createClient()`）を使用
3. **フォームには既存のパターンに従う**: React Hook Form + Zodスキーマ
4. **日本語UIを維持** - すべてのユーザー向けテキストは日本語にする
5. **マルチテナンシーを尊重** - クエリでは必ずorg_idでフィルタリング
6. **一貫性のためにcomponents/ui/のshadcn/uiコンポーネントを使用**

### 共通パターン

#### データベースクエリパターン
```typescript
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
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 作業履歴

### 2025-09-16: プロジェクト状況確認と品質向上作業

#### 実施した作業

1. **現状確認とトラブルシューティング**
   - 開発サーバー起動と基本機能動作確認
   - プロジェクト中断状況の把握とClerk認証統合の進捗確認

2. **Supabaseクライアント最適化**
   - 多重インスタンス警告を解決（シングルトンパターン実装）
   - `useSupabaseClient()`にuseMemoとMapを使用したキャッシュ機能追加
   - `src/lib/supabase-clerk.ts:15-57`でインスタンス管理を最適化

3. **ビルドエラー修正**
   - `.bak`ファイル削除によるプリレンダリングエラー解決
   - プロダクションビルド成功確認（11ページ正常生成）

4. **コード品質分析**
   - ESLintチェック実行：81件の問題特定（40エラー、41警告）
   - 主要問題：TypeScript `any`型、React Hooks依存関係、未使用変数

5. **ドキュメント更新**
   - `docs/DEVELOPMENT_ROADMAP.md`を現在の進捗で更新
   - Phase 2ほぼ完了、次期フェーズの詳細計画を追加

#### 確認した現状

**✅ 動作確認済み**
- Clerk認証統合（サインイン・サインアップページ）
- Supabase接続（カスタムヘッダー方式）
- 基本機能（機械管理、メンテナンス記録、分析）
- プロダクションビルド成功

**🚧 要対応項目**
- ESLintエラー81件（型安全性、React Hooks）
- maintenance_schedulesテーブル実装保留
- ミドルウェアunhandledRejection警告
- RLSポリシー再有効化（セキュリティ向上）

#### 次回優先作業

1. **コード品質向上（最優先）**
   - TypeScript `any`型を適切な型に置換（40箇所）
   - React Hooks依存関係修正（15箇所）
   - 未使用変数・import削除（20箇所）

2. **ミドルウェアエラー修正**
   - ClerkミドルウェアのunhandledRejection解決
   - 404エラーハンドリング改善

3. **データベース機能完成**
   - maintenance_schedulesテーブル作成
   - コメントアウト機能の有効化

#### 技術的成果

- **パフォーマンス向上**: Supabaseクライアントシングルトン化
- **安定性向上**: ビルドエラー解決、プロダクション対応
- **開発効率**: 問題箇所の体系的特定と優先度付け

#### 学習・改善点

- `.bak`ファイルはビルド対象から除外すべき
- ESLintルールの段階的適用でコード品質向上
- 開発サーバーログの定期的監視が重要