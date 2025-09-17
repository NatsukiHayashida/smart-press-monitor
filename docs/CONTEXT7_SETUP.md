# Context7 セットアップガイド

Context7は、AIコーディングアシスタントに最新のライブラリドキュメントとコード例を提供するMCP（Model Context Protocol）サーバーです。古い訓練データに依存することなく、常に最新のAPIドキュメントとコード例を参照できます。

## 📚 目次

1. [Context7とは](#context7とは)
2. [主な機能](#主な機能)
3. [システム要件](#システム要件)
4. [インストール手順](#インストール手順)
5. [使用方法](#使用方法)
6. [APIキーの取得](#apiキーの取得)
7. [対応クライアント](#対応クライアント)
8. [トラブルシューティング](#トラブルシューティング)
9. [参考リンク](#参考リンク)

## Context7とは

Context7は、LLM（大規模言語モデル）が古い訓練データに基づいて生成する問題を解決するツールです。

### 従来の問題点（Context7なし）
- ❌ 古い訓練データに基づくコード例
- ❌ 存在しないAPIの生成（ハルシネーション）
- ❌ 古いパッケージバージョンの汎用的な回答

### Context7による解決（Context7あり）
- ✅ 最新のバージョン固有のドキュメント
- ✅ 実際に動作するコード例
- ✅ ソースから直接取得した正確な情報

## 主な機能

1. **リアルタイムドキュメント取得**
   - 最新のライブラリドキュメントを動的に取得
   - バージョン固有の情報を提供

2. **ハルシネーション防止**
   - 実際に存在するAPIのみを参照
   - 正確なメソッド名とパラメータ

3. **シームレスな統合**
   - プロンプトに`use context7`を追加するだけ
   - タブ切り替え不要

4. **幅広い対応**
   - 主要なAIコーディングアシスタントをサポート
   - 人気ライブラリのドキュメントを網羅

## システム要件

### 必須要件
- **Node.js**: v18.0.0以上
- **対応クライアント**: 
  - Claude Code
  - Cursor
  - VS Code
  - Windsurf
  - その他MCPクライアント

### オプション
- **Context7 APIキー**: より高いレート制限用（無料アカウントで取得可能）

## インストール手順

### 1. Node.jsの確認

```bash
# Node.jsのバージョン確認
node --version
# v18.0.0以上であることを確認
```

### 2. Claude Codeへのインストール

#### ローカルサーバー接続（推奨）

```bash
# Context7をClaude Codeに追加
claude mcp add context7 -- npx -y @upstash/context7-mcp

# APIキー付きで追加する場合
claude mcp add context7 -- npx -y @upstash/context7-mcp --api-key YOUR_API_KEY
```

#### リモートサーバー接続

```bash
# HTTPトランスポートを使用
claude mcp add --transport http context7 https://mcp.context7.com/mcp --header "CONTEXT7_API_KEY: YOUR_API_KEY"
```

### 3. インストール確認

```bash
# MCPサーバーの状態を確認
claude mcp list

# 出力例：
# context7: npx -y @upstash/context7-mcp - ✓ Connected
```

### 4. Context7の削除（必要な場合）

```bash
# Context7を削除
claude mcp remove context7
```

## 使用方法

### 基本的な使い方

プロンプトの最後に`use context7`を追加するだけです：

```txt
Next.jsでJWTを使った認証ミドルウェアを実装して。use context7
```

```txt
Cloudflare WorkerでJSONレスポンスを5分間キャッシュする設定を教えて。use context7
```

```txt
Supabaseでリアルタイムデータベース更新を実装する方法は？use context7
```

### 効果的な使用例

1. **ライブラリの最新機能を使用**
   ```txt
   React 19の新しいServer Componentsの使い方を教えて。use context7
   ```

2. **特定バージョンのAPI**
   ```txt
   Next.js 15のApp Routerでミドルウェアを設定する方法。use context7
   ```

3. **フレームワーク統合**
   ```txt
   TailwindCSS v4をNext.jsプロジェクトに設定する手順。use context7
   ```

## APIキーの取得

### 1. アカウント作成

1. [context7.com/dashboard](https://context7.com/dashboard)にアクセス
2. 無料アカウントを作成
3. ダッシュボードにログイン

### 2. APIキーの生成

1. ダッシュボードで「Generate API Key」をクリック
2. APIキーをコピー
3. 安全な場所に保存

### 3. APIキーの設定

#### 方法1: コマンドライン引数

```bash
claude mcp remove context7
claude mcp add context7 -- npx -y @upstash/context7-mcp --api-key YOUR_API_KEY
```

#### 方法2: 環境変数

```bash
# Windows (コマンドプロンプト)
set CONTEXT7_API_KEY=YOUR_API_KEY

# Windows (PowerShell)
$env:CONTEXT7_API_KEY = "YOUR_API_KEY"

# macOS/Linux
export CONTEXT7_API_KEY=YOUR_API_KEY
```

### APIキーのメリット

- **高いレート制限**: 無料プランより多くのリクエストが可能
- **優先アクセス**: 混雑時でも安定した応答
- **使用状況の追跡**: ダッシュボードで利用状況を確認

## 対応クライアント

### Cursor

```json
// ~/.cursor/mcp.json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

### VS Code

```json
// settings.json
"mcp": {
  "servers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

### Windsurf

```json
// MCP設定ファイル
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

## トラブルシューティング

### 一般的な問題と解決方法

#### 1. "Node.js not found"エラー

**解決方法**：
- Node.js v18以上をインストール
- [nodejs.org](https://nodejs.org/)から最新版をダウンロード

#### 2. Context7が接続できない

**確認事項**：
```bash
# Node.jsバージョン確認
node --version

# npxが利用可能か確認
npx --version

# MCPサーバーの状態確認
claude mcp list
```

**解決方法**：
```bash
# Context7を再インストール
claude mcp remove context7
claude mcp add context7 -- npx -y @upstash/context7-mcp
```

#### 3. レート制限エラー

**症状**：
- 頻繁にタイムアウトが発生
- "Rate limit exceeded"メッセージ

**解決方法**：
- APIキーを取得して設定
- リクエスト頻度を調整

#### 4. ドキュメントが取得できない

**確認事項**：
- インターネット接続を確認
- ファイアウォール設定を確認
- プロキシ設定を確認

### デバッグ方法

1. **ログの確認**
   ```bash
   # MCPサーバーのログを確認
   claude mcp logs context7
   ```

2. **手動テスト**
   ```bash
   # Context7を直接実行してテスト
   npx -y @upstash/context7-mcp
   ```

3. **接続テスト**
   ```bash
   # HTTPSアクセスを確認
   curl https://mcp.context7.com/health
   ```

## プロジェクトへの貢献

### ライブラリの追加/更新

Context7に新しいライブラリを追加したい場合：

1. [GitHubリポジトリ](https://github.com/upstash/context7)をフォーク
2. `docs/adding-projects.md`を参照
3. プルリクエストを送信

### サポートされているライブラリ

現在サポートされている主要ライブラリ：
- React, Next.js, Vue.js
- Express, Fastify, NestJS
- Tailwind CSS, Material-UI
- Supabase, Firebase, Prisma
- その他多数

## 参考リンク

### 公式リソース
- **公式サイト**: [context7.com](https://context7.com)
- **GitHubリポジトリ**: [github.com/upstash/context7](https://github.com/upstash/context7)
- **ダッシュボード**: [context7.com/dashboard](https://context7.com/dashboard)
- **NPMパッケージ**: [@upstash/context7-mcp](https://www.npmjs.com/package/@upstash/context7-mcp)

### 関連ドキュメント
- **Claude Code MCP**: [docs.anthropic.com/claude-code/mcp](https://docs.anthropic.com/en/docs/claude-code/mcp)
- **Cursor MCP**: [docs.cursor.com/context/model-context-protocol](https://docs.cursor.com/context/model-context-protocol)
- **VS Code MCP**: [code.visualstudio.com/docs/copilot/chat/mcp-servers](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)

### コミュニティ
- **Smithery**: [smithery.ai/server/@upstash/context7-mcp](https://smithery.ai/server/@upstash/context7-mcp)
- **Issues**: [github.com/upstash/context7/issues](https://github.com/upstash/context7/issues)

## このプロジェクトでの設定

press_machine_dbプロジェクトでは、以下の設定でContext7を使用しています：

- **インストール方法**: ローカルサーバー接続
- **コマンド**: `npx -y @upstash/context7-mcp`
- **APIキー**: 未設定（必要に応じて追加可能）
- **用途**: 最新のNext.js、React、Supabaseドキュメントの参照

## 更新履歴

- **2024-09-16**: 初版作成、Claude Codeへの統合完了
- **統合状態**: ✓ Connected

---

*このドキュメントは、Context7 MCPサーバーのセットアップと使用方法をまとめたものです。最新情報は公式リポジトリを確認してください。*