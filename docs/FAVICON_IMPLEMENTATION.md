# ファビコンとPWA対応の実装

**実装日**: 2025-10-16
**コミット**: bae3f89

## 概要

プレス機械管理システム用のカスタムファビコンとPWA対応を実装しました。デフォルトのVercelファビコンから、プレス機をモチーフにした独自のアイコンデザインに変更し、スマホのホーム画面追加にも対応しました。

## 作成したファイル

### アイコンファイル
- `src/app/icon.svg` - ベクターアイコン（Next.js 15の自動最適化対応）
- `src/app/favicon.ico` - ブラウザタブ用（32x32 PNG形式）
- `public/apple-touch-icon.png` - iOS用（180x180）
- `public/icon-192.png` - PWA用（192x192）
- `public/icon-512.png` - PWA用（512x512）
- `public/favicon-16x16.png` - 小サイズ用（16x16）
- `public/favicon-32x32.png` - 標準サイズ用（32x32）

### 設定ファイル
- `public/manifest.json` - PWA設定（アプリ名、テーマカラー、アイコン定義）
- `scripts/generate-icons.mjs` - SVGから各サイズのPNG/ICO自動生成スクリプト

### 更新ファイル
- `src/app/layout.tsx` - PWAメタデータ追加（manifest、appleWebApp、themeColor、viewport）
- `package.json` - `generate-icons` スクリプト追加

## デザイン仕様

### カラースキーム
- **メインカラー**: `#1e40af` (濃い青 - Tailwind blue-800相当)
- **アクセントカラー**: `#93c5fd`, `#60a5fa`, `#3b82f6`, `#dbeafe` (青系グラデーション)
- **背景**: `#1e40af` (メインカラーと同一)

### モチーフ
プレス機のシルエットを簡略化したデザイン:
- 上部プレート（横長の長方形、角丸4px）
- 油圧シリンダー左右2本（縦長の長方形）
- プレスヘッド（台形状、中央に配置）
- 下部ベースプレート（横長の長方形、角丸4px）
- 装飾ボルト（4隅に配置、直径12pxの円）

### SVG構造
```svg
<svg viewBox="0 0 512 512">
  - 背景: 角丸80pxの正方形
  - プレス機パーツ: rect/path要素で構成
  - ボルト: circle要素
  - サイズ: 512x512px
</svg>
```

## PWA設定

### manifest.json
```json
{
  "name": "プレス機械管理システム",
  "short_name": "プレス管理",
  "display": "standalone",
  "theme_color": "#1e40af",
  "background_color": "#ffffff",
  "orientation": "portrait-primary"
}
```

### layout.tsx メタデータ
```typescript
metadata: {
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "プレス管理"
  },
  themeColor: "#1e40af",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1
  }
}
```

## アイコン生成スクリプト

### scripts/generate-icons.mjs
- `sharp` パッケージを使用してSVGからPNG変換
- 生成サイズ: 16x16, 32x32, 180x180, 192x192, 512x512
- favicon.icoは32x32のPNGをicoファイル名で保存

### 使用方法
```bash
npm run generate-icons
```

## Next.js 15のアイコン規約

### 自動検出ファイル
- `app/icon.svg` - 自動的にファビコンとして使用
- `app/favicon.ico` - フォールバック用
- `public/*.png` - manifest.jsonから参照

### メタデータAPI
Next.js 15のMetadata APIで自動的に以下を生成:
- `<link rel="icon">` タグ
- `<link rel="apple-touch-icon">` タグ
- `<meta name="theme-color">` タグ
- `<link rel="manifest">` タグ

## 技術的な詳細

### sharp依存関係
プロジェクトには既に `sharp` がインストール済み（Next.jsの画像最適化で使用）

### ファイルサイズ
- icon.svg: ~1.2KB（テキストSVG）
- favicon.ico: 538 bytes（32x32 PNG）
- apple-touch-icon.png: 2.9KB（180x180）
- icon-192.png: 2.9KB（192x192）
- icon-512.png: 8.7KB（512x512）

### ブラウザ対応
- **モダンブラウザ**: SVGアイコン使用
- **レガシーブラウザ**: favicon.icoフォールバック
- **iOS Safari**: apple-touch-icon.png使用
- **Android Chrome**: manifest.json経由でicon-192.png/512.png使用

## デプロイ

### Vercel自動デプロイ
- コミット: `bae3f89`
- ブランチ: `main`
- 自動デプロイ完了後、本番環境でファビコン反映

### キャッシュクリア
ブラウザキャッシュが残る場合:
- **Chrome/Edge**: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
- **Safari**: Cmd+Option+R
- **完全クリア**: DevTools > Application > Clear storage

## 今後のメンテナンス

### アイコン変更時の手順
1. `src/app/icon.svg` を編集
2. `npm run generate-icons` で全サイズ再生成
3. git commit & push

### カラー変更時
以下の3箇所を更新:
- `src/app/icon.svg` - fill属性
- `src/app/layout.tsx` - themeColor
- `public/manifest.json` - theme_color

## 参考リンク
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [PWA Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Apple Touch Icon](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
