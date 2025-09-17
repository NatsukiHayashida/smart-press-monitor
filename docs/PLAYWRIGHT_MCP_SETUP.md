# Playwright MCP セットアップガイド

Playwright MCPは、MicrosoftのPlaywrightを使用してブラウザ自動化機能を提供するModel Context Protocol (MCP) サーバーです。スクリーンショットベースではなく、構造化されたアクセシビリティスナップショットを通じてWebページと相互作用できます。

## 📚 目次

1. [Playwright MCPとは](#playwright-mcpとは)
2. [主な特徴](#主な特徴)
3. [システム要件](#システム要件)
4. [インストール手順](#インストール手順)
5. [設定オプション](#設定オプション)
6. [使用方法](#使用方法)
7. [ユーザープロファイル管理](#ユーザープロファイル管理)
8. [トラブルシューティング](#トラブルシューティング)
9. [参考リンク](#参考リンク)

## Playwright MCPとは

Playwright MCPは、LLM（大規模言語モデル）がWebページと相互作用するためのツールです。従来のスクリーンショットベースのアプローチとは異なり、構造化されたアクセシビリティデータを使用して確実で高速な操作を実現します。

### 従来の問題点
- スクリーンショットベースで不正確
- 視覚的に調整されたモデルが必要
- あいまいな操作結果

### Playwright MCPの利点
- 構造化データによる正確な操作
- 視覚モデル不要
- 決定論的なツール適用

## 主な特徴

1. **高速で軽量**
   - Playwrightのアクセシビリティツリーを使用
   - ピクセルベースの入力を回避

2. **LLMフレンドリー**
   - 視覚モデル不要
   - 純粋に構造化データで動作

3. **決定論的操作**
   - スクリーンショットベースのあいまいさを回避
   - 正確で再現可能な操作

4. **多ブラウザサポート**
   - Chrome、Firefox、WebKit対応
   - マルチプラットフォーム

## システム要件

### 必須要件
- **Node.js**: 18以上
- **対応クライアント**:
  - Claude Code
  - VS Code
  - Cursor
  - Windsurf
  - その他MCPクライアント

### システム依存
- **Windows**: Chromium自動インストール
- **macOS**: Webkitサポート
- **Linux**: 各種ブラウザエンジン対応

## インストール手順

### 1. Node.jsの確認

```bash
# Node.jsバージョン確認
node --version
# v18.0.0以上であることを確認
```

### 2. Claude Codeへのインストール

```bash
# Playwright MCPをClaude Codeに追加
claude mcp add playwright -- npx @playwright/mcp@latest
```

### 3. インストール確認

```bash
# MCPサーバーの状態確認
claude mcp list

# 出力例：
# playwright: npx @playwright/mcp@latest - ✓ Connected
```

### 4. Playwright MCPの削除（必要な場合）

```bash
# Playwright MCPを削除
claude mcp remove playwright
```

## 設定オプション

Playwright MCPは豊富な設定オプションを提供します：

### ブラウザ設定

```bash
# ブラウザの指定
--browser chrome|firefox|webkit|msedge

# ヘッドレスモード（デフォルト: ヘッドありモード）
--headless

# デバイスエミュレーション
--device "iPhone 15"

# ビューポートサイズ
--viewport-size "1280,720"

# ユーザーエージェント
--user-agent "Custom User Agent"
```

### セキュリティとネットワーク

```bash
# 許可オリジン（セミコロン区切り）
--allowed-origins "https://example.com;https://test.com"

# ブロックオリジン
--blocked-origins "https://ads.com;https://tracking.com"

# HTTPSエラーを無視
--ignore-https-errors

# サンドボックス無効化
--no-sandbox

# プロキシサーバー
--proxy-server "http://proxy:3128"

# プロキシバイパス
--proxy-bypass ".com,chromium.org"
```

### セッション管理

```bash
# 分離モード（メモリ内プロファイル）
--isolated

# ストレージ状態ファイル
--storage-state "/path/to/storage.json"

# ユーザーデータディレクトリ
--user-data-dir "/path/to/userdata"

# セッション保存
--save-session

# トレース保存
--save-trace
```

### タイムアウト設定

```bash
# アクション タイムアウト（デフォルト: 5000ms）
--timeout-action 10000

# ナビゲーション タイムアウト（デフォルト: 60000ms）
--timeout-navigation 30000
```

### 高度なオプション

```bash
# 追加機能（カンマ区切り）
--caps vision,pdf

# CDP エンドポイント
--cdp-endpoint "ws://localhost:9222"

# 設定ファイル
--config "/path/to/config.json"

# シークレットファイル（.env形式）
--secrets "/path/to/.env"

# 出力ディレクトリ
--output-dir "/path/to/output"
```

## 使用方法

### 基本的なWeb操作

```txt
Google検索で「Next.js tutorial」を検索して、最初の結果をクリックしてください
```

```txt
このサイトのログインフォームに「test@example.com」と「password123」を入力してログインしてください
```

```txt
このページの全てのリンクを抽出して、リスト形式で表示してください
```

### E2Eテストシナリオ

```txt
以下の手順でテストを実行してください：
1. サイトのトップページにアクセス
2. 商品検索で「laptop」を検索
3. 検索結果の最初の商品をクリック
4. カートに追加ボタンをクリック
5. カートページで商品が追加されていることを確認
```

### フォーム操作

```txt
お問い合わせフォームに以下の情報を入力してください：
- 名前: テスト太郎
- メール: test@example.com
- 件名: お問い合わせ
- 内容: テストメッセージです
そして送信ボタンをクリックしてください
```

### スクレイピング

```txt
このページの製品情報をすべて抽出して、CSVフォーマットで出力してください
```

### パフォーマンステスト

```txt
このページの読み込み時間を測定し、Core Web Vitalsの数値を取得してください
```

## ユーザープロファイル管理

### プロファイルの種類

#### 1. 永続プロファイル（デフォルト）

通常のブラウザのように、ログイン情報やクッキーが保存されます。

**保存場所**：
```bash
# Windows
%USERPROFILE%\AppData\Local\ms-playwright\mcp-chrome-profile

# macOS
~/Library/Caches/ms-playwright/mcp-chrome-profile

# Linux
~/.cache/ms-playwright/mcp-chrome-profile
```

**使用例**：
```bash
# カスタムプロファイルディレクトリ
claude mcp add playwright -- npx @playwright/mcp@latest --user-data-dir "/path/to/custom/profile"
```

#### 2. 分離モード

各セッションが独立したプロファイルで実行され、ブラウザを閉じると状態が失われます。

```bash
# 分離モードで実行
claude mcp add playwright -- npx @playwright/mcp@latest --isolated
```

#### 3. ブラウザ拡張接続

既存のブラウザインスタンスに接続する方法：

```bash
# ブラウザ拡張経由で接続
claude mcp add playwright -- npx @playwright/mcp@latest --extension
```

## プロジェクト設定例

### Next.jsアプリケーションのテスト

```bash
# 開発サーバー用設定
claude mcp add playwright-dev -- npx @playwright/mcp@latest \
  --browser chrome \
  --viewport-size "1920,1080" \
  --timeout-action 10000 \
  --save-trace \
  --output-dir "./playwright-traces"
```

### 本番環境のテスト

```bash
# 本番環境用設定
claude mcp add playwright-prod -- npx @playwright/mcp@latest \
  --browser chrome \
  --headless \
  --isolated \
  --timeout-navigation 30000 \
  --allowed-origins "https://yoursite.com" \
  --save-session
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. ブラウザが起動しない

**症状**：
- "Browser not found"エラー
- タイムアウトエラー

**解決方法**：
```bash
# Playwrightブラウザを手動インストール
npx playwright install

# 特定ブラウザのみインストール
npx playwright install chrome

# システムブラウザを使用
claude mcp add playwright -- npx @playwright/mcp@latest --executable-path "/path/to/chrome"
```

#### 2. 権限エラー

**解決方法**：
```bash
# サンドボックス無効化（Linuxの場合）
claude mcp add playwright -- npx @playwright/mcp@latest --no-sandbox

# 実行可能ファイルに権限付与
chmod +x /path/to/browser
```

#### 3. ネットワーク接続エラー

**確認事項**：
- プロキシ設定
- ファイアウォール設定
- DNS設定

**解決方法**：
```bash
# プロキシ設定
claude mcp add playwright -- npx @playwright/mcp@latest --proxy-server "http://proxy:8080"

# HTTPSエラー無視
claude mcp add playwright -- npx @playwright/mcp@latest --ignore-https-errors
```

#### 4. メモリ不足

**解決方法**：
```bash
# ヘッドレスモード使用
claude mcp add playwright -- npx @playwright/mcp@latest --headless

# 分離モード使用
claude mcp add playwright -- npx @playwright/mcp@latest --isolated
```

### デバッグ方法

#### 1. トレースの有効化

```bash
# トレース保存を有効化
claude mcp add playwright -- npx @playwright/mcp@latest --save-trace --output-dir "./traces"
```

#### 2. ヘッドモードでの実行

```bash
# ブラウザを表示して実行
claude mcp add playwright -- npx @playwright/mcp@latest
# （デフォルトがヘッドモード）
```

#### 3. ログの確認

```bash
# MCPサーバーのログを確認
claude mcp logs playwright

# 詳細ログ
DEBUG=pw:* claude mcp restart playwright
```

## 高度な使用例

### カスタムコンテキスト設定

設定ファイル（`playwright-config.json`）を使用：

```json
{
  "contextOptions": {
    "viewport": { "width": 1920, "height": 1080 },
    "userAgent": "Custom Test Agent",
    "permissions": ["geolocation", "camera"],
    "geolocation": { "latitude": 35.6762, "longitude": 139.6503 },
    "locale": "ja-JP",
    "timezoneId": "Asia/Tokyo"
  }
}
```

```bash
# 設定ファイルを使用
claude mcp add playwright -- npx @playwright/mcp@latest --config "./playwright-config.json"
```

### CI/CD環境での使用

```bash
# CI用の設定
claude mcp add playwright-ci -- npx @playwright/mcp@latest \
  --headless \
  --no-sandbox \
  --isolated \
  --timeout-navigation 30000 \
  --save-trace \
  --output-dir "/tmp/playwright-traces"
```

## 参考リンク

### 公式リソース
- **GitHubリポジトリ**: [github.com/microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- **Playwright公式**: [playwright.dev](https://playwright.dev)
- **NPMパッケージ**: [@playwright/mcp](https://www.npmjs.com/package/@playwright/mcp)

### 関連ドキュメント
- **Playwright API**: [playwright.dev/docs/api/class-page](https://playwright.dev/docs/api/class-page)
- **MCP仕様**: [modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Claude Code MCP**: [docs.anthropic.com/claude-code/mcp](https://docs.anthropic.com/en/docs/claude-code/mcp)

### このプロジェクトでの設定

press_machine_dbプロジェクトでは、以下の設定でPlaywright MCPを使用しています：

- **インストール方法**: `npx @playwright/mcp@latest`
- **ブラウザ**: Chrome（デフォルト）
- **モード**: ヘッドモード（デフォルト）
- **プロファイル**: 永続プロファイル
- **用途**: Webアプリケーションのテスト、フォーム操作、スクレイピング

## 更新履歴

- **2024-09-16**: 初版作成、Claude Codeへの統合完了
- **統合状態**: ✓ Connected

---

*このドキュメントは、Playwright MCPサーバーのセットアップと使用方法をまとめたものです。最新情報は公式リポジトリを確認してください。*