# Serena セットアップガイド

Serenaは、言語モデルを高度なコーディングアシスタントに変換する強力なツールキットです。セマンティックコード検索と編集機能を提供し、様々なプログラミング言語と開発環境で効率的なコード操作を可能にします。

## 📚 目次

1. [Serenaとは](#serenaとは)
2. [システム要件](#システム要件)
3. [インストール手順](#インストール手順)
4. [プロジェクト設定](#プロジェクト設定)
5. [使用方法](#使用方法)
6. [トラブルシューティング](#トラブルシューティング)
7. [参考リンク](#参考リンク)

## Serenaとは

### 主な特徴
- **20以上のプログラミング言語をサポート**
- **Language Server Protocol (LSP) を使用した正確なコード解析**
- **セマンティックコード検索と編集**
- **複数のAIコーディングアシスタントとの統合**
- **Webベースのダッシュボード**
- **プロジェクト固有の設定が可能**

### サポート言語
TypeScript, JavaScript, Python, Java, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, Scala, Dart, SQL, HTML, CSS, その他多数

## システム要件

### 必須要件
- **OS**: Windows 10/11, macOS, Linux
- **パッケージマネージャー**: uv (Astral社製)
- **Git**: バージョン管理システム
- **Claude Code**: または他の対応AIアシスタント

### Windows固有の設定
```bash
# Git改行設定（Windows）
git config --global core.autocrlf true
```

## インストール手順

### 1. uvパッケージマネージャーのインストール

#### Windows (PowerShell)
```powershell
# PowerShellを管理者権限で実行
irm https://astral.sh/uv/install.ps1 | iex
```

#### macOS/Linux
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. Serenaのインストール

```bash
# Serenaをインストール（初回実行時に自動的にダウンロード）
uvx --from git+https://github.com/oraios/serena serena --help
```

### 3. Claude Codeへの統合

#### Windows
```bash
claude mcp add serena -- "C:\\Users\\%USERNAME%\\.local\\bin\\uvx.exe" --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "%CD%"
```

#### macOS/Linux
```bash
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "$(pwd)"
```

### 4. インストール確認

```bash
# MCPサーバーのリスト表示と接続確認
claude mcp list

# 出力例：
# serena: ... - ✓ Connected
```

## プロジェクト設定

### プロジェクト設定ファイルの作成

`.serena/project.yml`をプロジェクトルートに作成：

```yaml
# Serena Project Configuration
name: your_project_name
description: プロジェクトの説明

# プロジェクトのルートディレクトリ
root: .

# 使用言語
languages:
  - typescript
  - javascript
  - python
  - sql

# 除外パターン
exclude:
  - node_modules
  - .git
  - .next
  - dist
  - build
  - "*.log"
  - "*.tmp"
  - ".cache"

# 含めるディレクトリ
include:
  - src
  - lib
  - components
  - pages
  - api

# 言語固有の設定
settings:
  typescript:
    tsconfig: tsconfig.json
  python:
    version: "3.x"
  database:
    type: postgresql

# カスタムコマンド
commands:
  dev: "npm run dev"
  build: "npm run build"
  test: "npm test"
  lint: "npm run lint"

# メタデータ
metadata:
  framework: "Next.js"
  backend: "Supabase"
  ui: "Tailwind CSS"
```

### グローバル設定（オプション）

`%USERPROFILE%\.serena\serena_config.yml`（Windows）または`~/.serena/serena_config.yml`（Unix系）：

```yaml
# Serena Global Configuration
default_context: ide-assistant

# ログ設定
logging:
  level: info
  file: serena.log

# パフォーマンス設定
performance:
  max_workers: 4
  cache_size: 100MB

# 言語サーバー設定
language_servers:
  typescript:
    memory_limit: 2048
  python:
    memory_limit: 1024
```

## 使用方法

### 基本コマンド

```bash
# プロジェクトのアクティベート
uvx --from git+https://github.com/oraios/serena serena activate

# 設定の編集
uvx --from git+https://github.com/oraios/serena serena config edit

# ステータス確認
uvx --from git+https://github.com/oraios/serena serena status

# ログ表示
uvx --from git+https://github.com/oraios/serena serena logs
```

### Claude Codeでの使用

Serenaが正しく設定されていれば、Claude Codeは自動的に以下の機能を利用できます：

1. **シンボル検索** - 関数、クラス、変数の定義を検索
2. **参照検索** - シンボルが使用されている場所を検索
3. **リファクタリング** - 名前変更、抽出、移動などの操作
4. **コード補完** - コンテキストに基づく提案
5. **エラー診断** - リアルタイムのエラー検出

### コンテキストモード

Serenaは複数のコンテキストモードをサポート：

- **ide-assistant**: IDE統合用（推奨）
- **code-review**: コードレビュー特化
- **refactoring**: リファクタリング特化
- **testing**: テスト作成特化

## トラブルシューティング

### よくある問題と解決方法

#### 1. "uv: command not found"エラー

**解決方法**：
```bash
# Windows - PATHに追加
set Path=C:\Users\%USERNAME%\.local\bin;%Path%

# PowerShell
$env:Path = "C:\Users\$env:USERNAME\.local\bin;$env:Path"

# Unix系
export PATH="$HOME/.local/bin:$PATH"
```

#### 2. Serenaが接続できない

**確認事項**：
- uvが正しくインストールされているか
- プロジェクトパスが正しいか
- ファイアウォール/アンチウイルスがブロックしていないか

**解決方法**：
```bash
# Serenaを削除して再追加
claude mcp remove serena
claude mcp add serena -- [正しいコマンド]
```

#### 3. 言語サーバーが起動しない

**解決方法**：
- メモリ制限を増やす
- 不要な除外パターンを削除
- ログを確認：`uvx --from git+https://github.com/oraios/serena serena logs`

#### 4. Windows特有の問題

**パスの問題**：
- バックスラッシュをエスケープ（`\\`）または順スラッシュ（`/`）を使用
- パスにスペースがある場合は引用符で囲む

**改行コードの問題**：
```bash
git config --global core.autocrlf true
```

### デバッグモード

詳細なログを有効にする：

```yaml
# .serena/project.yml に追加
debug: true
verbose: true
```

## 参考リンク

### 公式リソース
- **GitHubリポジトリ**: https://github.com/oraios/serena
- **ドキュメント**: https://github.com/oraios/serena/wiki
- **Issues**: https://github.com/oraios/serena/issues

### 関連ツール
- **uv (Astral)**: https://docs.astral.sh/uv/
- **Claude Code**: https://claude.ai/code
- **Language Server Protocol**: https://microsoft.github.io/language-server-protocol/

### このプロジェクトでの設定

このプロジェクト（press_machine_db）では、以下の設定でSerenaを使用しています：

- **プロジェクトパス**: `C:\Users\CATIA\Documents\Claude\press_machine_db`
- **設定ファイル**: `.serena/project.yml`
- **対応言語**: TypeScript, JavaScript, Python, SQL
- **コンテキスト**: ide-assistant

## 更新履歴

- **2024-09-16**: 初版作成、Windows環境でのセットアップ完了
- **設定ファイル作成**: `.serena/project.yml`を追加
- **Claude Code統合**: MCPサーバーとして正常に接続確認

---

*このドキュメントは、Serena v1.x系を対象としています。最新情報は公式リポジトリを確認してください。*