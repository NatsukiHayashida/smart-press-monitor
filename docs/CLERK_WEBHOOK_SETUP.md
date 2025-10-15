# Clerk Webhook設定ガイド - ドメイン制限

## 概要

このガイドでは、`@iidzka.co.jp`ドメインのみのサインアップを許可し、既存の`ibron1975@gmail.com`を例外とするwebhookの設定方法を説明します。

## 実装内容

- **許可されるドメイン**: `@iidzka.co.jp`
- **例外アカウント**: `ibron1975@gmail.com`（既存ユーザー）
- **動作**: 許可されていないドメインでサインアップした場合、ユーザーは自動的に削除されます

## セットアップ手順

### 1. 環境変数の設定

`.env.local`ファイルに以下を追加（まだ値は空で問題ありません）：

```bash
CLERK_WEBHOOK_SECRET=
```

### 2. Clerk Dashboardでのwebhook設定

#### 開発環境（ローカル）の場合

**Option A: ngrokを使用**

1. ngrokをインストール（未インストールの場合）：
   ```bash
   npm install -g ngrok
   ```

2. ngrokでローカルサーバーを公開：
   ```bash
   ngrok http 3000
   ```

3. ngrokが表示する`Forwarding` URLをコピー（例: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`）

4. [Clerk Dashboard](https://dashboard.clerk.com/) にアクセス
   - **Webhooks** → **Add Endpoint** をクリック
   - **Endpoint URL**: `https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/webhooks/clerk`
   - **Subscribe to events**: `user.created` のみ選択
   - **Create** をクリック

5. 作成されたwebhookの**Signing Secret**をコピー

6. `.env.local`を更新：
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx
   ```

7. 開発サーバーを再起動：
   ```bash
   npm run dev
   ```

**Option B: Clerk CLI を使用（推奨）**

1. Clerk CLIをインストール：
   ```bash
   npm install -g @clerk/clerk-cli
   ```

2. Clerk CLIでログイン：
   ```bash
   clerk login
   ```

3. ローカルwebhookリスナーを起動：
   ```bash
   clerk listen --forward-url http://localhost:3000/api/webhooks/clerk
   ```

4. Clerk CLIが表示する**Webhook Secret**を`.env.local`に追加

#### 本番環境の場合

1. [Clerk Dashboard](https://dashboard.clerk.com/) にアクセス

2. **Webhooks** → **Add Endpoint** をクリック

3. 以下の設定：
   - **Endpoint URL**: `https://your-domain.com/api/webhooks/clerk`
   - **Subscribe to events**: `user.created` のみ選択
   - **Create** をクリック

4. 作成されたwebhookの**Signing Secret**をコピー

5. 本番環境の環境変数に追加：
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx
   ```

### 3. 動作確認

#### テストケース

1. **許可されるケース**: `test@iidzka.co.jp`でサインアップ
   - ✅ サインアップ成功
   - ✅ プロファイル自動作成
   - ✅ ダッシュボードにアクセス可能

2. **拒否されるケース**: `test@gmail.com`でサインアップ
   - ⚠️ サインアップは一時的に成功（Clerkの仕様）
   - 🚫 webhook処理でユーザーが自動削除
   - ❌ ログインできない

3. **例外ケース**: `ibron1975@gmail.com`でログイン
   - ✅ ログイン成功（既存ユーザー）
   - ✅ 全機能利用可能

#### ログの確認

開発サーバーのコンソールで以下のログを確認：

```bash
# 許可されたドメイン
✅ 許可されたドメイン: test@iidzka.co.jp

# 拒否されたドメイン
🚫 許可されていないドメイン: test@gmail.com
✅ ユーザーを削除しました: test@gmail.com
```

## トラブルシューティング

### Webhookが動作しない

1. **環境変数を確認**：
   ```bash
   # .env.localに正しいCLERK_WEBHOOK_SECRETが設定されているか
   ```

2. **開発サーバーを再起動**：
   ```bash
   npm run dev
   ```

3. **ngrokのURLを確認**：
   - ngrokを再起動すると、URLが変わるため、Clerk Dashboardも更新が必要

4. **Clerk Dashboardでwebhookステータスを確認**：
   - **Webhooks** → 作成したwebhookをクリック
   - **Recent Deliveries**でリクエスト/レスポンスを確認

### ユーザーが削除されない

1. **webhookイベントが正しく選択されているか確認**：
   - `user.created`イベントが選択されているか

2. **webhook URLが正しいか確認**：
   - `/api/webhooks/clerk`で終わっているか
   - HTTPSプロトコルを使用しているか

3. **Clerk Dashboard の Recent Deliveries を確認**：
   - ステータスコード200が返っているか
   - エラーメッセージがないか

## 実装ファイル

- **Webhookエンドポイント**: `src/app/api/webhooks/clerk/route.ts`
- **ミドルウェア**: `src/middleware.ts`（webhookをパブリックルートに追加）

## 追加のセキュリティ対策（オプション）

1. **レート制限**: サインアップ試行回数を制限
2. **通知**: 不正なサインアップ試行時に管理者に通知
3. **ログ記録**: すべてのサインアップ試行をログに記録

## 関連ドキュメント

- [Clerk Webhooks Documentation](https://clerk.com/docs/integrations/webhooks)
- [Svix Webhook Verification](https://docs.svix.com/receiving/verifying-payloads/how)
