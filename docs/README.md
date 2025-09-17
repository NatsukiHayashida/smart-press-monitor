# Smart Press Monitor 🏭

プレス機とメンテナンス記録の統合管理システム

## 🌟 概要

Smart Press Monitor は、製造業におけるプレス機の効率的な管理とメンテナンス記録の一元化を実現するWebアプリケーションです。

### 主要機能
- ✅ **プレス機管理** - 機械情報の登録・編集・一覧表示
- ✅ **メンテナンス記録** - 保守作業の記録と履歴管理
- ✅ **リアルタイム同期** - Supabaseによるリアルタイムデータ更新
- ✅ **レスポンシブデザイン** - モバイル・デスクトップ対応

## 🚀 技術スタック

### フロントエンド
- **Next.js 15.5.2** - React フレームワーク (App Router)
- **React 19.1.0** - UIライブラリ
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **shadcn/ui** - UIコンポーネント

### バックエンド
- **Supabase** - PostgreSQL データベース & 認証
- **Row Level Security (RLS)** - セキュリティ

### 開発ツール
- **Turbopack** - 高速バンドラー
- **ESLint** - コード品質
- **PostCSS** - CSS処理

## 📦 インストール・起動

### 前提条件
- Node.js 18.0+ 
- npm または yarn
- Supabase プロジェクト

### セットアップ手順

1. **リポジトリクローン**
   ```bash
   git clone <repository-url>
   cd press_machine_db
   ```

2. **Webアプリセットアップ**
   ```bash
   cd press-machine-web
   npm install
   ```

3. **環境変数設定**
   ```bash
   # press-machine-web/.env.local を作成
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_DEFAULT_ORG_ID=your_organization_id
   ```

4. **データベース初期化**
   ```bash
   # Supabase ダッシュボードで supabase_schema.sql を実行
   ```

5. **開発サーバー起動**
   ```bash
   npm run dev
   ```
   
   http://localhost:3000 でアクセス

## 📁 プロジェクト構造

```
press_machine_db/
├── press-machine-web/          # Next.js Webアプリ (メイン)
│   ├── src/
│   │   ├── app/               # App Router ページ
│   │   ├── components/        # Reactコンポーネント
│   │   ├── lib/              # ユーティリティ
│   │   └── types/            # TypeScript型定義
│   └── package.json
├── press_machine_app.py        # Python デスクトップアプリ
├── setup_database.py          # DB初期化スクリプト
├── supabase_schema.sql        # データベーススキーマ
└── docs/                      # ドキュメント
```

## 🗄️ データベース設計

### テーブル構成
- **orgs** - 組織情報
- **profiles** - ユーザープロフィール
- **press_machines** - プレス機データ
- **maintenance_records** - メンテナンス記録

### セキュリティ
- Row Level Security (RLS) による組織レベルのデータ分離
- Supabase Auth による認証・認可

## 🚀 デプロイ

### Vercel デプロイ
```bash
npx vercel --prod
```

### 環境変数設定
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `NEXT_PUBLIC_DEFAULT_ORG_ID`

## 📊 開発状況

- ✅ 基本UI・認証システム
- ✅ プレス機管理機能
- ✅ メンテナンス記録機能  
- ✅ Supabase連携
- ✅ リアルタイム更新
- ⏳ 分析・レポート機能
- ⏳ 本格的な認証システム

## 🤝 コントリビューション

1. フォークする
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. コミット (`git commit -m 'Add amazing feature'`)
4. プッシュ (`git push origin feature/amazing-feature`) 
5. プルリクエスト作成

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 📞 サポート

問題や質問がある場合は、Issue を作成してください。

---

**Smart Press Monitor** - プレス機管理の未来を今すぐ体験 🚀