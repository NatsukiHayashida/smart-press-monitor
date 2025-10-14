# RLS権限テストチェックリスト

## 🔐 テスト概要

- **管理者**: ibron1975@gmail.com, yamamoto@iidzka.co.jp
- **閲覧ユーザー**: その他すべてのメールアドレス

---

## ✅ テスト1: 管理者権限テスト

### アカウント: ibron1975@gmail.com または yamamoto@iidzka.co.jp

#### プレス機管理
- [ ] `/machines` - プレス機一覧が表示される
- [ ] `/machines/new` - 新規作成ページにアクセスできる
- [ ] **新規作成** - プレス機を新規作成できる
- [ ] **編集** - プレス機を編集できる
- [ ] **削除** - プレス機を削除できる（確認ダイアログ表示）

#### メンテナンス記録管理
- [ ] `/maintenance` - メンテナンス記録一覧が表示される
- [ ] `/maintenance/new` - 新規作成ページにアクセスできる
- [ ] **新規作成** - メンテナンス記録を新規作成できる
- [ ] **編集** - メンテナンス記録を編集できる
- [ ] **削除** - メンテナンス記録を削除できる（確認ダイアログ表示）

#### エラーがないこと
- [ ] ブラウザコンソールに権限エラーが表示されない
- [ ] トースト通知で成功メッセージが表示される

---

## ❌ テスト2: 閲覧ユーザー権限テスト

### アカウント: 管理者以外のメールアドレス

#### プレス機管理（閲覧のみ）
- [ ] `/machines` - プレス機一覧が表示される（閲覧可能）
- [ ] `/machines/[id]` - プレス機詳細が表示される（閲覧可能）
- [ ] `/machines/new` - 新規作成を試みる → **エラーメッセージ**が表示される
- [ ] **編集ボタン** - 編集を試みる → **「この操作には管理者権限が必要です」**エラー
- [ ] **削除ボタン** - 削除を試みる → **「この操作には管理者権限が必要です」**エラー

#### メンテナンス記録管理（閲覧のみ）
- [ ] `/maintenance` - メンテナンス記録一覧が表示される（閲覧可能）
- [ ] `/maintenance/[id]` - メンテナンス記録詳細が表示される（閲覧可能）
- [ ] `/maintenance/new` - 新規作成を試みる → **エラーメッセージ**が表示される
- [ ] **編集ボタン** - 編集を試みる → **「この操作には管理者権限が必要です」**エラー
- [ ] **削除ボタン** - 削除を試みる → **「この操作には管理者権限が必要です」**エラー

#### エラーメッセージの確認
- [ ] トースト通知で「この操作には管理者権限が必要です」と表示される
- [ ] ブラウザコンソールで権限エラーが記録される
- [ ] アプリケーションがクラッシュしない

---

## 🔍 テスト3: データベース確認

### Supabase SQLエディターで実行

```sql
-- 1. RLS状態の確認
SELECT
  tablename,
  CASE WHEN rowsecurity THEN '✅ 有効' ELSE '❌ 無効' END as "RLS状態"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'press_machines', 'maintenance_records')
ORDER BY tablename;
```

**期待結果**: すべて「✅ 有効」

```sql
-- 2. ユーザーロールの確認
SELECT
  user_id,
  email,
  role,
  org_id
FROM profiles
ORDER BY role DESC, email;
```

**期待結果**:
- ibron1975@gmail.com → role = 'admin'
- yamamoto@iidzka.co.jp → role = 'admin'
- その他のユーザー → role = 'viewer'

```sql
-- 3. プレス機データの確認
SELECT
  id,
  machine_number,
  org_id,
  created_at
FROM press_machines
ORDER BY id
LIMIT 5;
```

**期待結果**: データが正常に表示される

---

## 🐛 トラブルシューティング

### 問題: 「ユーザー情報が見つかりません」エラー

**詳細なデバッグ手順**: `docs/PROFILE_DEBUG_GUIDE.md` を参照

**クイックチェック:**
1. 開発サーバーのログを確認
   - `🔍 getUserPermissions: userId =` で始まるログを確認
   - Clerk User IDとメールアドレスをメモ

2. 手動でプロファイルを作成
   - `database/create_profile_manual.sql` を使用
   - ログから取得したClerk User IDを使用

3. 環境変数を確認
   ```bash
   # .env.local に以下が設定されているか確認
   NEXT_PUBLIC_DEFAULT_ORG_ID=c897453e-14c7-4335-bdb4-91978778d95b
   SUPABASE_SERVICE_ROLE_KEY=[サービスロールキー]
   ```

### 問題: 管理者でも編集できない

**確認事項:**
1. ユーザーのロールを確認
   ```sql
   SELECT email, role FROM profiles WHERE email = 'your-email@example.com';
   ```

2. ブラウザコンソールのエラーを確認
   - F12 → Console タブ

3. アプリケーションを再起動
   ```bash
   npm run dev
   ```

4. ブラウザのキャッシュをクリア
   - Ctrl + Shift + R（強制リロード）

### 問題: 閲覧ユーザーでも編集できてしまう

**確認事項:**
1. Server Actionsが最新版か確認
   ```bash
   git status
   # machines/actions.ts と maintenance/actions.ts が更新されているか
   ```

2. ビルドをやり直す
   ```bash
   npm run build
   npm run start
   ```

3. データベースのロールを確認
   ```sql
   SELECT email, role FROM profiles;
   ```

### 問題: データが全く表示されない

**確認事項:**
1. org_idが設定されているか確認
   ```sql
   SELECT user_id, email, org_id FROM profiles;
   ```

2. 環境変数を確認
   ```bash
   # .env.local
   NEXT_PUBLIC_DEFAULT_ORG_ID=c897453e-14c7-4335-bdb4-91978778d95b
   ```

3. RLS状態を確認
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables
   WHERE tablename IN ('press_machines', 'maintenance_records');
   ```

---

## 📝 テスト結果の報告

テスト完了後、以下の情報を記録してください:

### 成功したテスト
- [ ] 管理者権限テスト: すべてパス
- [ ] 閲覧ユーザー権限テスト: すべてパス
- [ ] データベース確認: すべて正常

### 発見された問題
- 問題1: （あれば記載）
- 問題2: （あれば記載）

### ブラウザコンソールのエラー
```
（エラーがあればコピー）
```

---

## ✅ テスト完了確認

すべてのテストがパスしたら:
- [ ] 管理者は全操作可能
- [ ] 閲覧ユーザーは閲覧のみ、編集時にエラー
- [ ] RLSが有効化されている
- [ ] エラーメッセージが適切に表示される
- [ ] アプリケーションが安定している

**テスト完了日時**: ___________

**テスト実施者**: ___________

**結果**: ✅ 合格 / ❌ 不合格
