# Smart Press Monitor - プレス機スマート監視システム仕様書

## 🎯 プロジェクト概要
プレス機とメンテナンス記録を統合管理するWebアプリケーション

**開発状況**: 開発中（認証システム構築完了、データ表示機能開発中）
**最終更新**: 2025年9月3日

---

## 📋 システム仕様

### 🏗️ アーキテクチャ
- **フロントエンド**: Next.js 15.5.2 (App Router) + React 19.1.0
- **バックエンド/データベース**: Supabase (PostgreSQL)
- **UI/スタイル**: Tailwind CSS + shadcn/ui
- **認証**: Supabase Auth (Magic Link)
- **型安全性**: TypeScript
- **バリデーション**: React Hook Form + Zod
- **アイコン**: Lucide React

### 🌐 デプロイメント情報
- **開発サーバー**: http://localhost:3001
- **Supabase プロジェクト**: https://qlsntrswoaxdwrtobunw.supabase.co
- **認証設定**: Site URL = http://localhost:3001

---

## 📊 データベース設計

### テーブル構成

#### 1. orgs (組織)
```sql
- id: UUID (Primary Key)
- name: VARCHAR (組織名)
- created_at: TIMESTAMP
```

#### 2. profiles (ユーザープロフィール)
```sql
- user_id: UUID (Primary Key, Auth Users参照)
- org_id: UUID (orgsテーブル参照、NULL可)
- email: VARCHAR
- full_name: VARCHAR
- created_at: TIMESTAMP
```

#### 3. press_machines (プレス機)
```sql
- id: INTEGER (Primary Key, Auto Increment)
- org_id: UUID (組織ID)
- machine_number: VARCHAR (機械番号、必須)
- equipment_number: VARCHAR (設備番号)
- manufacturer: VARCHAR (メーカー)
- model_type: VARCHAR (型式)
- serial_number: VARCHAR (シリアル番号)
- machine_type: VARCHAR (種別: '圧造'/'その他')
- production_group: INTEGER (生産グループ)
- tonnage: NUMERIC (トン数)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 4. maintenance_records (メンテナンス記録)
```sql
- id: INTEGER (Primary Key, Auto Increment)
- org_id: UUID (組織ID)
- press_id: INTEGER (プレス機ID参照)
- maintenance_datetime: TIMESTAMP (メンテナンス日時)
- overall_judgment: VARCHAR (総合判定)
- clutch_valve_replacement: VARCHAR (クラッチバルブ交換状況)
- brake_valve_replacement: VARCHAR (ブレーキバルブ交換状況)
- remarks: TEXT (備考)
- created_at: TIMESTAMP
```

#### 5. user_org_access (ビュー)
```sql
- user_id: UUID
- email: VARCHAR
- full_name: VARCHAR
- org_id: UUID
- org_name: VARCHAR
```

### 現在のデータ状況
- **プレス機データ**: 33台登録済み (組織ID: c897453e-14c7-4335-bdb4-91978778d95b)
- **メンテナンス記録**: 1件登録済み
- **組織データ**: 設定が必要（現在空）
- **プロフィールデータ**: 認証時に自動作成予定

---

## 🔐 認証システム

### 現在の実装状況
- **認証方式**: Supabase Magic Link (メール認証)
- **プロバイダー**: シンプル認証プロバイダー (ユーザー情報のみ)
- **状態管理**: React Context API

### 認証フロー
1. ユーザーがメールアドレスを入力 → `/auth/login`
2. Supabaseがマジックリンクをメール送信
3. ユーザーがメール内のリンクをクリック
4. `/auth/callback` でトークンを処理
5. ダッシュボード (`/`) にリダイレクト

### 課題・TODO
- [ ] プロフィール機能の安全な実装
- [ ] 組織管理機能
- [ ] ユーザーの組織への自動割り当て

---

## 🖥️ フロントエンド構成

### ページ構成
```
/                     → ダッシュボード (認証済みユーザー用)
/auth/login           → ログインページ
/auth/callback        → 認証コールバック処理
/machines             → プレス機一覧 (実装済み)
/machines/new         → 新規プレス機登録 (実装済み)
/machines/[id]        → プレス機詳細・編集 (実装済み)
/maintenance          → メンテナンス記録一覧 (実装済み)
/analytics            → 分析・レポート (未実装)
/debug                → デバッグページ (開発用)
/test                 → テストページ (開発用)
```

### コンポーネント構成
```
src/components/
├── auth/
│   ├── AuthProvider.tsx              → 元の認証プロバイダー (現在未使用)
│   ├── AuthProvider-simple.tsx       → シンプル認証プロバイダー (現在使用中)
│   ├── AuthProvider-with-profile.tsx → プロフィール付きプロバイダー (問題発生中)
│   └── LoginForm.tsx                 → ログインフォーム
├── layout/
│   └── Header.tsx                    → ヘッダーコンポーネント
├── machines/
│   ├── MachineTable.tsx              → プレス機一覧テーブル
│   └── MachineForm.tsx               → プレス機登録・編集フォーム
├── maintenance/
│   ├── MaintenanceTable.tsx          → メンテナンス記録テーブル
│   └── MaintenanceForm.tsx           → メンテナンス記録フォーム
└── ui/
    ├── button.tsx, card.tsx, etc.    → shadcn/ui基本コンポーネント
    ├── badge.tsx                     → バッジコンポーネント (追加実装)
    └── separator.tsx                 → セパレーターコンポーネント (追加実装)
```

### 型定義
- `src/types/database.ts` → Supabaseデータベース型定義
- TypeScript strict mode有効
- 全主要テーブルの型定義完備

---

## 🚀 開発環境

### 必要な環境
- Node.js (v18以降推奨)
- npm または yarn
- Supabase アカウント

### 環境設定ファイル
```
.env.local:
NEXT_PUBLIC_SUPABASE_URL=https://qlsntrswoaxdwrtobunw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 開発サーバー起動
```bash
cd press-machine-web
npm run dev      # または npx next dev --port 3001 --turbopack
```

### ビルド・テスト
```bash
npm run build    # 本番ビルド
npm run lint     # ESLint実行
```

---

## 🐛 既知の問題・制限事項

### 現在の問題
1. **プロフィール機能**: 複雑な認証プロバイダーで無限ループ発生
   - 原因: useEffect依存関係の問題
   - 現在の対処: シンプル認証プロバイダーで運用

2. **組織管理**: orgsテーブルが空のため組織情報が表示されない
   - 影響: データフィルタリング機能制限
   - 対処予定: デフォルト組織の自動作成

3. **データ表示**: プロフィール情報がないため一部ページでデータ読み込みできない
   - 影響: プレス機一覧、メンテナンス記録ページ
   - 代替案: 固定組織IDでの一時的な対応

### ブラウザ対応
- Chrome/Edge: 完全対応
- Firefox: 対応
- Safari: 未テスト

---

## 📝 開発履歴

### 完了項目
- ✅ Next.js基本セットアップ
- ✅ Supabaseデータベース設計・構築
- ✅ 認証システム基盤構築
- ✅ UI/UXコンポーネント実装
- ✅ プレス機管理機能（CRUD）
- ✅ メンテナンス記録管理機能
- ✅ データベースからのCSVインポート機能
- ✅ Responsive design対応

### 開発中項目
- 🔄 プロフィール・組織管理機能
- 🔄 データ表示最適化
- 🔄 エラーハンドリング強化

### 未実装項目
- ⏳ 分析・レポート機能
- ⏳ ファイルアップロード機能
- ⏳ 通知システム
- ⏳ モバイルアプリ対応
- ⏳ 多言語対応

---

## 🎨 UI/UX デザイン

### デザインシステム
- **カラーパレット**: Tailwind CSS default colors
- **タイポグラフィ**: Geist Sans / Geist Mono
- **レスポンシブ**: Mobile-first approach
- **アクセシビリティ**: WCAG 2.1 Level AA準拠予定

### 主要ページデザイン
- **ダッシュボード**: カード形式の機能別ナビゲーション
- **データテーブル**: shadcn/ui Table component使用
- **フォーム**: React Hook Form + バリデーション
- **ローディング**: スピナー + 説明文
- **エラー表示**: Toast notification (予定)

---

## 📊 パフォーマンス

### 現在のメトリクス
- **初回ロード**: ~4-5秒 (開発環境)
- **ページ遷移**: ~500ms-1秒
- **バンドルサイズ**: Next.js 15 with Turbopack

### 最適化施策
- Turbopack使用（高速バンドル）
- Tree shaking有効
- 画像最適化（Next.js built-in）
- コードスプリッティング（App Router）

---

## 🔒 セキュリティ

### 実装済みセキュリティ機能
- Supabase Row Level Security (RLS)
- HTTPS強制 (本番環境予定)
- 環境変数による秘匿情報管理
- クロスサイトスクリプティング (XSS) 対策

### セキュリティ考慮事項
- データベースアクセス権限設定
- ユーザー入力サニタイゼーション
- ファイルアップロード制限（実装予定）

---

## 📞 サポート・問い合わせ

### 開発チーム
- **主担当**: Claude (Anthropic)
- **協力予定**: GPT-5
- **ユーザー**: CATIA

### 技術サポート
- Supabase Documentation
- Next.js Documentation
- GitHub Issues (予定)

---

## 📄 ライセンス
プロジェクト固有ライセンス (商用利用検討)

---

*最終更新: 2025年9月3日 09:44*
*バージョン: 1.0.0-beta*