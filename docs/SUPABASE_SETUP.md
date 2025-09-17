# Smart Press Monitor - Supabaseセットアップガイド

## 🚀 セットアップ手順

### Step 1: Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com) にアクセスしてアカウントを作成
2. 「New project」をクリック
3. プロジェクト名: `smart-press-monitor`
4. データベースパスワードを設定
5. リージョンを選択（Asia Northeast (Tokyo) 推奨）
6. 「Create new project」をクリック

### Step 2: データベースセットアップ

プロジェクト作成後、左メニューの「SQL Editor」を開き、以下の順序でSQLファイルの内容をコピー＆ペーストして実行します：

#### 2-1. 基本テーブル作成
`supabase_setup_step1.sql` の内容をコピーして実行
- 組織テーブル
- プロフィールテーブル  
- プレス機テーブル
- メンテナンス記録テーブル

#### 2-2. トリガーとインデックス
`supabase_setup_step2.sql` の内容をコピーして実行
- 更新時刻自動更新トリガー
- パフォーマンス向上用インデックス

#### 2-3. セキュリティ設定
`supabase_setup_step3.sql` の内容をコピーして実行
- Row Level Security (RLS) 有効化
- アクセス制御ポリシー設定

#### 2-4. 初期データ・ヘルパー機能
`supabase_setup_step4.sql` の内容をコピーして実行
- ユーザー登録時の自動プロフィール作成
- デフォルト組織作成
- 開発用ビュー作成

### Step 3: データの移行

1. 左メニューの「Table Editor」を開く
2. 以下のCSVファイルをインポート：
   - `press_machines_supabase.csv` → `press_machines` テーブル
   - `maintenance_records_supabase.csv` → `maintenance_records` テーブル

### Step 4: API設定の取得

1. 左メニューの「Settings」→「API」を開く
2. 以下の値をコピー：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsIn...`

### Step 5: Next.jsアプリの環境変数設定

`.env.local` ファイルを更新：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 6: ユーザーの組織設定

初回ログイン後：

1. Table Editor で `profiles` テーブルを開く
2. 自分のユーザーレコードの `org_id` を設定：
   ```
   550e8400-e29b-41d4-a716-446655440000
   ```

## ✅ セットアップ完了の確認

- [ ] 4つのSQLステップがエラーなく実行完了
- [ ] CSVデータのインポート完了
- [ ] 環境変数の設定完了
- [ ] Next.jsアプリでログイン成功
- [ ] プレス機一覧にデータが表示
- [ ] メンテナンス記録にデータが表示

## 🛠 トラブルシューティング

### エラー: "relation does not exist"
→ Step 1のテーブル作成が未完了。再実行してください。

### エラー: "permission denied"
→ Step 3のRLS設定が未完了。再実行してください。

### ログイン後にデータが表示されない
→ Step 6でユーザーのorg_id設定を確認してください。

## 📞 サポート

問題が解決しない場合は、以下の情報と共にお知らせください：
- Supabaseのエラーメッセージ
- 実行したSQLステップ
- ブラウザのコンソールエラー