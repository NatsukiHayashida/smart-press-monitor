## 1. 基本理念

Apple Human Interface Guidelines の洗練されたデザイン哲学を基盤としつつ、産業用プレス機管理システムとしての機能性と信頼性を表現します。現代的なデザインシステム（shadcn/ui）を採用し、清潔感・明瞭性・直感性を追求し、アクセシビリティを最優先に考慮したユーザー体験を提供します。

## 2. テーマシステム（shadcn/ui準拠）

### CSS変数ベースのテーマ設定

現代的なテーマ管理のため、CSS変数を使用したshadcn/uiのテーマシステムを採用します。`components.json`で`cssVariables: true`を設定し、柔軟で保守性の高いデザインシステムを構築します。
 
### CSS変数定義（Zinc Theme - 産業システム適合）

```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.705 0.015 286.067);
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.985 0 0);
  --primary: oklch(0.92 0.004 286.32);
  --primary-foreground: oklch(0.21 0.006 285.885);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
}
```

### Tailwindクラスでの使用方法

```tsx
// 基本的な背景とテキスト
<div className="bg-background text-foreground" />

// プライマリボタン
<button className="bg-primary text-primary-foreground" />

// カード
<div className="bg-card text-card-foreground border border-border" />

// 入力フィールド
<input className="bg-background border border-input text-foreground" />
```

### カスタムカラー追加例

プロジェクト固有の「警告」カラーを追加する場合：

```css
:root {
  --warning: oklch(0.84 0.16 84);
  --warning-foreground: oklch(0.28 0.07 46);
}

.dark {
  --warning: oklch(0.41 0.11 46);
  --warning-foreground: oklch(0.99 0.02 95);
}

@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```
 
### カラー使用ルール
 
- 基本的にshadcn/uiの定義済み変数を使用（`bg-background`, `text-foreground`など）
- カスタムカラーが必要な場合のみ新規変数を定義
- ダークモードとライトモードの両方に対応した値を設定
- WCAG 2.1準拠のコントラスト比を確保（4.5:1以上、理想的には7:1以上）
- 同じ色相の変数同士の組み合わせは避ける
 
## 3. 角丸システム（CSS変数ベース）

### radius変数の使用

shadcn/uiでは`--radius`変数で統一的な角丸を管理します：

```css
:root {
  --radius: 0.625rem; /* 10px */
}
```

### コンポーネント別設定

- **ボタン**: `rounded-md` (--radius * 0.8)
- **カード**: `rounded-lg` (--radius)
- **入力フィールド**: `rounded-md` (--radius * 0.8)
- **モーダル・ダイアログ**: `rounded-lg` (--radius)
- **ドロップダウン・ポップオーバー**: `rounded-md` (--radius * 0.8)
- **バッジ・ラベル**: `rounded-full` または `rounded-md`

### shadcn/ui推奨クラス

```tsx
// 基本的な角丸
<div className="rounded-md" />

// カード用
<div className="rounded-lg" />

// 完全に丸い要素
<div className="rounded-full" />
```
 
## 4. 余白体系
 
### 基本単位（8px ベース）
 
- 極小: 2px (0.5rem)
- 最小: 4px (1rem)
- 小: 8px (2rem)
- 標準: 16px (4rem)
- 中: 24px (6rem)
- 大: 32px (8rem)
- 特大: 48px (12rem)
- 最大: 64px (16rem)
 
### ボタン内余白（タッチターゲット 44px 確保）
 
- 小ボタン: px-3 py-2.5 (12px 10px) - 最小 44px 高さ
- 標準ボタン: px-6 py-3 (24px 12px) - 48px 高さ
- 大ボタン: px-8 py-4 (32px 16px) - 56px 高さ
- アイコンボタン: p-3 (12px) - 48px x 48px
 
### カード内余白
 
- 小カード: p-4 (16px)
- 標準カード: p-5 (20px)
- 大カード: p-6 (24px)
- 特大カード: p-8 (32px)
 
### セクション間隔
 
- 要素間: space-y-2 (8px)
- コンポーネント間: space-y-4 (16px)
- セクション内: space-y-6 (24px)
- セクション間: space-y-8 (32px)
- ページセクション間: space-y-12 (48px)
 
## 5. 影の適用
 
### 標準影設定
 
- ボタン標準影: shadow-sm (0 1px 2px rgba(0, 0, 0, 0.05))
- ボタンホバー影: shadow-md (0 4px 6px rgba(0, 0, 0, 0.07))
- プライマリボタン影: shadow-md (常時適用)
- カード標準影: shadow-sm
- カードホバー影: shadow-md
- モーダル影: shadow-xl (0 20px 25px rgba(0, 0, 0, 0.1))
- ドロップダウン影: shadow-lg (0 10px 15px rgba(0, 0, 0, 0.1))
 
### 影の使用原則
 
- 全てのインタラクティブ要素（ボタン、リンク）には必ず影を付与
- ホバー時は影を一段階強化してフィードバックを提供
- 非インタラクティブ要素の影は控えめに（shadow-sm 程度）
- 重要度の高い要素ほど強い影を使用
- 同一画面内で影の強度は最大 3 段階まで
 
## 6. タイポグラフィ
 
### フォントウェイト
 
- 大見出し: font-bold (700)
- 見出し: font-semibold (600)
- 強調テキスト: font-semibold (600)
- ボタンテキスト: font-semibold (600) - 視認性重視
- 本文: font-normal (400)
- キャプション: font-normal (400)
- 軽いテキスト: font-light (300) - 使用は最小限
 
### フォントサイズ階層
 
- 大見出し: text-4xl (36px) + font-bold + leading-tight
- 見出し 1: text-3xl (30px) + font-semibold + leading-tight
- 見出し 2: text-2xl (24px) + font-semibold + leading-snug
- 見出し 3: text-xl (20px) + font-semibold + leading-snug
- 見出し 4: text-lg (18px) + font-semibold + leading-normal
- 本文: text-base (16px) + font-normal + leading-relaxed
- 小さい本文: text-sm (14px) + font-normal + leading-relaxed
- キャプション: text-xs (12px) + font-normal + leading-normal
 
### コントラスト要件（WCAG 2.1 準拠）
 
- 通常テキスト: 4.5:1 以上（gray-600 以上推奨）
- 大きなテキスト（18px 以上または太字 14px 以上）: 3:1 以上
- 白背景の青テキスト: blue-700 以上を使用（7:1 以上）
- 青背景の白テキスト: 常に白色（#FFFFFF）
- 重要な情報: 7:1 以上（AAA 対応）
 
### 行間・文字間隔
 
- 見出し: leading-tight (1.25)
- 本文: leading-relaxed (1.625)
- 長文: leading-loose (2)
- 文字間隔: tracking-normal（特別な場合のみ調整）
 
## 7. コンポーネント設計
 
### ボタン設計原則
 
- 全てのボタンに影を付与（押せることを明示）
- 最小タッチターゲットサイズ 44px x 44px を確保
- フォントウェイトは semibold 以上で視認性向上
- 同一画面内での色の重複を避ける
- disabled 状態は明確に区別（透明度 0.5 など）
- ホバー時には cursor-pointer や色、影の変更などによりリアクションを付ける
 
### プライマリボタン
 
- 背景色: bg-blue-500
- テキスト色: text-white
- フォント: font-semibold
- 影: shadow-md
- ホバー: bg-blue-600 + shadow-lg
- フォーカス: ring-2 ring-blue-500 ring-offset-2
- 無効化: opacity-50 + cursor-not-allowed
 
### セカンダリボタン
 
- 背景色: bg-white
- テキスト色: text-blue-700
- ボーダー: border-2 border-blue-700
- フォント: font-semibold
- 影: shadow-sm
- ホバー: bg-blue-50 + shadow-md
- フォーカス: ring-2 ring-blue-500 ring-offset-2
 
### 危険ボタン
 
- 背景色: bg-red-600
- テキスト色: text-white
- フォント: font-semibold
- 影: shadow-md
- ホバー: bg-red-700 + shadow-lg
 
### カード設計
 
- 背景: bg-white
- 境界線: border border-gray-300（視認性確保）
- 影: shadow-md（視認性を高めるため sm から md に変更）
- ホバー: shadow-lg + border-gray-400
- 角丸: rounded-2xl
- 内余白: p-5 または p-6
 
### バッジ・ラベル設計
 
- 背景: 薄色背景は避け、はっきりした色を使用
- 境界線: border border-{color}-300 または border-gray-300（必須）
- テキスト色: 背景とのコントラスト比 4.5:1 以上
- 内余白: px-2 py-1 または px-3 py-1
- 角丸: rounded-md または rounded-lg
- フォント: text-sm font-medium
- 影: shadow-sm（必要に応じて）
 
### 入力フィールド
 
- 背景: bg-white
- 境界線: border border-gray-300
- フォーカス: border-blue-500 + ring-2 ring-blue-500 ring-opacity-20
- エラー: border-red-500 + ring-2 ring-red-500 ring-opacity-20
- プレースホルダー: placeholder-gray-500
- 最小高さ: h-12（48px）
 
### ナビゲーション
 
- アクティブ状態: bg-blue-700 + text-white
- ホバー状態: bg-blue-50 + text-blue-700
- 非アクティブ: text-gray-700
- フォーカス: ring-2 ring-blue-500 ring-inset
 
## 8. レイアウトシステム
 
### コンテナ
 
- 最大幅: max-w-4xl (常に w-full と併用し、固定の横幅として使用)
- 中央寄せ: mx-auto
- 水平余白: px-4 sm:px-6 lg:px-8
- 垂直余白: py-8 sm:py-12 lg:py-16
 
### グリッドシステム
 
- 1 カラム: grid-cols-1
- 2 カラム: grid-cols-1 md:grid-cols-2
- 3 カラム: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- 4 カラム: grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
- 間隔: gap-4 sm:gap-6 lg:gap-8
 
### フレックスレイアウト
 
- 水平配置: flex items-center justify-between
- 垂直配置: flex flex-col items-center
- 中央寄せ: flex items-center justify-center
- 間隔: space-x-4 / space-y-4
 
## 9. インタラクション
 
### ホバー効果
 
- ボタン: 色の深化 + 影の強化 + scale-105（わずかな拡大）
- カード: 影の強化 + 境界線の濃化
- リンク: 色の変化 + underline
- アイコン: 色の変化 + rotate-12（わずかな回転）
 
### フォーカス状態（アクセシビリティ重要）
 
- 入力要素: ring-2 ring-blue-500 ring-opacity-50
- ボタン: ring-2 ring-blue-500 ring-offset-2
- リンク: ring-2 ring-blue-500 ring-offset-1
- コントラスト比: 3:1 以上確保
 
### アクティブ状態
 
- ボタン: scale-95（わずかな縮小）
- リンク: 色の更なる深化
- 入力要素: ring-2 ring-blue-600
 
### トランジション
 
- 標準: transition-all duration-200 ease-in-out
- 色のみ: transition-colors duration-150 ease-in-out
- 影のみ: transition-shadow duration-200 ease-in-out
- 変形: transition-transform duration-150 ease-in-out
 
### ローディング状態
 
- スピナー: animate-spin
- パルス: animate-pulse
- 背景: bg-gray-100（コンテンツ部分）
- 透明度: opacity-50
 
## 10. アクセシビリティ
 
### キーボード操作
 
- Tab 順序の論理的な設定
- Enter/Space キーでのボタン操作
- Escape キーでのモーダル終了
- 矢印キーでのナビゲーション
 
### スクリーンリーダー対応
 
- 適切な aria-label 設定
- heading 階層の正しい使用
- フォーム要素の label 関連付け
- 状態変化の音声通知（aria-live）
 
### 視覚的配慮
 
- 色のみに依存しない情報提示
- 十分なコントラスト比の確保
- 文字サイズの可変性
- 動画・アニメーションの制御オプション
 
### モーション配慮
 
- prefers-reduced-motion メディアクエリ対応
- 必要最小限のアニメーション
- 自動再生の回避
- 点滅・フラッシュの制限
 
## 11. レスポンシブデザイン
 
### ブレークポイント
 
- sm: 640px 以上
- md: 768px 以上
- lg: 1024px 以上
- xl: 1280px 以上
- 2xl: 1536px 以上
 
### レスポンシブ調整
 
- フォントサイズ: text-sm md:text-base lg:text-lg
- 余白: p-4 md:p-6 lg:p-8
- グリッド: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- 表示・非表示: hidden md:block / block md:hidden
 
## 12. 実装チェックリスト
 
### 必須項目（アクセシビリティ）
 
- [ ] WCAG コントラスト要件の遵守（4.5:1 以上）
- [ ] キーボードナビゲーション対応
- [ ] 適切な aria 属性設定
- [ ] フォーカスインジケーターの視認性（3:1 以上）
- [ ] 最小タッチターゲット 44px 確保
- [ ] スクリーンリーダー対応のテキスト
 
### 必須項目（デザイン）
 
- [ ] グレースケールの使用（真っ黒・真っ白の適切な使用）
- [ ] 8px ベースの余白システム
- [ ] 角丸の一貫性（lg, xl, 2xl, 3xl）
- [ ] 全インタラクティブ要素への影付与
- [ ] スムーズなトランジション（200ms 以下）
- [ ] ボタンテキストは font-semibold 以上
- [ ] 白背景の青テキストは blue-700 以上
- [ ] カードには明確な境界線（border-gray-300）と影（shadow-md）
- [ ] バッジには明確な境界線または濃い背景色で視認性確保
 
### 推奨項目（UX 向上）
 
- [ ] ホバー効果の統一（影の強化）
- [ ] フォーカス状態の明確化
- [ ] ローディング状態の実装
- [ ] エラーメッセージの親切な表示
- [ ] 成功フィードバックの実装
- [ ] プログレッシブエンハンスメント
- [ ] パフォーマンス最適化
 
### 色使いの注意点
 
- [ ] 同色系の組み合わせ回避
- [ ] 薄色背景の使用制限
- [ ] システムカラーの適切な使用
- [ ] 無効状態の明確な表示
 
### 品質保証
 
- [ ] 複数ブラウザでの動作確認
- [ ] 複数デバイスでの表示確認
- [ ] アクセシビリティツールでの検証
- [ ] パフォーマンス測定
- [ ] ユーザビリティテスト実施
 
## 13. 禁止事項
 
### 絶対に避けるべき要素
 
- [ ] 薄すぎる色の使用（コントラスト不足）
- [ ] 同色系の重複（青背景に青ボタンなど）
- [ ] 不要な薄色背景の多用
- [ ] 影のないインタラクティブ要素
- [ ] 44px 未満のタッチターゲット
- [ ] キーボード操作不可能な要素
- [ ] 色のみに依存した情報提示
- [ ] 自動再生される音声・動画
- [ ] 点滅・フラッシュ効果の使用
 
### 制限的使用項目
 
- [ ] 薄色背景（-50, -100 系）は目的が明確な場合のみ
- [ ] アニメーション効果は控えめに
- [ ] 装飾的要素は最小限に
- [ ] カスタムフォントは読みやすさ重視
- [ ] 影の多用は避ける（最大 3 段階）