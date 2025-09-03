# Smart Press Monitor

TkinterベースのデスクトップアプリからNext.js + Supabaseを使用したモダンなWebアプリケーションに移行したスマートプレス機監視システムです。

## 🚀 主な機能

- **認証システム**: Supabase AuthによるMagic Linkログイン
- **プレス機管理**: プレス機の登録・編集・削除・検索
- **メンテナンス記録**: メンテナンス履歴の登録・管理
- **リアルタイム更新**: Supabase Realtimeによる自動更新
- **マルチテナント**: 組織単位でのデータ分離
- **レスポンシブ対応**: モバイル・タブレット・デスクトップ対応

## 🛠 技術スタック

- **フロントエンド**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **認証**: Supabase Auth
- **データベース**: Supabase (PostgreSQL)
- **リアルタイム**: Supabase Realtime
- **デプロイ**: Vercel

## 📋 セットアップ手順

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)でアカウントを作成し、新しいプロジェクトを作成
2. SQL Editorで`../supabase_schema.sql`の内容を実行

### 2. データの移行

1. 既存のSQLiteデータからCSVをエクスポート（親ディレクトリで実行）:
   ```bash
   python export_to_csv.py
   python prepare_supabase_data.py
   ```

2. SupabaseのTable Editorで以下のCSVファイルをインポート:
   - `press_machines_supabase.csv` → `press_machines`テーブル
   - `maintenance_records_supabase.csv` → `maintenance_records`テーブル

### 3. Next.jsアプリケーションの設定

1. 依存関係をインストール:
   ```bash
   npm install
   ```

2. 環境変数を設定:
   ```bash
   cp .env.local.example .env.local
   ```
   
   `.env.local`を編集してSupabaseの設定を入力:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. 開発サーバーを起動:
   ```bash
   npm run dev
   ```

### 4. ユーザーの組織設定

初回ログイン後、データにアクセスするには`profiles`テーブルでユーザーの`org_id`を設定:

1. Supabaseダッシュボードの「Table Editor」で`profiles`テーブルを開く
2. ユーザーレコードの`org_id`を`550e8400-e29b-41d4-a716-446655440000`に設定

## 🌐 デプロイメント

### Vercelへのデプロイ

1. GitHubにプロジェクトをプッシュ
2. [Vercel](https://vercel.com)でプロジェクトをインポート
3. 環境変数を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. デプロイを実行

## 📊 主要な改善点

### Tkinterアプリからの変更点

1. **マルチユーザー対応**: 複数の端末から同時アクセス可能
2. **リアルタイム同期**: データの変更が即座に全端末に反映
3. **レスポンシブデザイン**: モバイル・タブレット対応
4. **認証システム**: セキュアなユーザー認証
5. **マルチテナント**: 組織単位でのデータ分離
6. **クラウド対応**: インターネット経由でのアクセス
