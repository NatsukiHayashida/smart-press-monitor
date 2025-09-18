# Press Machine DB Project Overview

## プロジェクト概要
レガシーのPython/TkinterデスクトップアプリからNext.js 15 Webアプリケーションへ移行したマルチテナント型プレス機管理システム。

## 技術スタック
- **フロントエンド**: Next.js 15.5.2, React 19.1.0, TypeScript 5.9.2
- **UI**: Tailwind CSS v4, shadcn/ui, Radix UI
- **認証**: Clerk (v6.32.0) - Supabase Authから移行済み
- **データベース**: Supabase (PostgreSQL with RLS)
- **フォーム管理**: React Hook Form + Zod validation
- **テスト**: Playwright

## プロジェクト構造
```
press_machine_db/
├── press-machine-web/     # Next.jsアプリケーション
│   ├── src/
│   │   ├── app/          # App Routerページ
│   │   ├── components/   # Reactコンポーネント
│   │   ├── lib/          # ユーティリティ・設定
│   │   └── types/        # TypeScript型定義
├── database/             # SQLスキーマ・マイグレーション
├── docs/                 # プロジェクトドキュメント
├── python/               # レガシーPythonコード
├── scripts/              # ユーティリティスクリプト
└── .serena/              # Serena MCP設定
```

## 主要機能
- マルチテナント対応（組織ごとのデータ分離）
- プレス機械の管理（CRUD操作）
- メンテナンス記録の管理
- 生産グループによる機械分類
- リアルタイムデータ同期

## 認証フロー
1. Clerk認証（マジックリンク）
2. Supabaseへのカスタムトークン伝達
3. Row Level Security (RLS)による組織別データアクセス制御