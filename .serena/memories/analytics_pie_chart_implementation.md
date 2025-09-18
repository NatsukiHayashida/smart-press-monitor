# 統計レポートページ Pie Chart 実装記録

## 実装日
2025-09-18

## 実装内容

### 1. 基本機能追加
- 統計・レポートページ (`src/app/analytics/page.tsx`) に Pie Chart を実装
- 種別別集計と生産グループ別集計の2つのブロックにチャートを追加
- shadcn/ui Charts と recharts ライブラリを使用

### 2. 技術的な実装
- **Chart コンポーネント**: `src/components/ui/chart.tsx` を作成
- **依存関係追加**: `recharts@^2.15.4` をpackage.jsonに追加
- **レスポンシブレイアウト**: Pie Chart (3/5幅) とスタッツリスト (2/5幅) のバランス調整
- **ホバー機能**: ツールチップで「項目名: 台数」形式の表示

### 3. バッジシステムの統一
#### 種別バッジの色設定
- 圧造: 青色 (`bg-blue-100 text-blue-800 border-blue-200`)
- 汎用: スレート色 (`bg-slate-100 text-slate-800 border-slate-200`)
- その他: オレンジ色 (`bg-orange-100 text-orange-800 border-orange-200`)

#### 生産グループバッジの色設定
- 生産1: エメラルド (`bg-emerald-100 text-emerald-800 border-emerald-200`)
- 生産2: シアン (`bg-cyan-100 text-cyan-800 border-cyan-200`)
- 生産3: パープル (`bg-purple-100 text-purple-800 border-purple-200`)
- 東大阪: イエロー (`bg-yellow-100 text-yellow-800 border-yellow-200`)
- 本社: レッド (`bg-red-100 text-red-800 border-red-200`)
- 試作: インディゴ (`bg-indigo-100 text-indigo-800 border-indigo-200`)
- その他: ローズ (`bg-rose-100 text-rose-800 border-rose-200`)

### 4. Pie Chart の色設定
Pie Chart の色をバッジの色と統一して視覚的な一貫性を確保:

#### 種別 Pie Chart
- 圧造: `#3b82f6` (blue-500)
- 汎用: `#64748b` (slate-500)
- その他: `#f97316` (orange-500)

#### 生産グループ Pie Chart
- 生産1: `#10b981` (emerald-500)
- 生産2: `#06b6d4` (cyan-500)
- 生産3: `#a855f7` (purple-500)
- 東大阪: `#eab308` (yellow-500)
- 本社: `#ef4444` (red-500)
- 試作: `#6366f1` (indigo-500)
- その他: `#f43f5e` (rose-500)

### 5. プレス機一覧ページとの統一
- `src/components/machines/MachineTable.tsx` にも同じバッジシステムを適用
- 統計ページとプレス機一覧で同じ項目が同じ色で表示される

### 6. レイアウト調整
- **グリッドレイアウト**: `grid-cols-5` (Pie Chart: 3カラム、リスト: 2カラム)
- **間隔調整**: `gap-8` でコンテンツ間の適切な余白を確保
- **右側パディング**: `md:pr-6` で右マージンのバランス調整
- **台数の整列**: `justify-between` と `tabular-nums` で数値を右揃え

### 7. Chart の詳細設定
- **開始位置**: 12時方向から開始 (`startAngle={90}`, `endAngle={450}`)
- **サイズ**: `max-h-[200px]` で適切な高さに調整
- **ツールチップ**: `hideLabel` と `formatter` でカスタム表示
- **レスポンシブ**: `aspect-square` で正方形を維持

### 8. 解決した課題
- **円グラフの切れ**: マージンとサイズ調整で解決
- **色の区別**: 類似色を変更して視認性向上
- **バッジの余分なスペース**: `flex-1` を削除してコンテンツ幅に調整
- **統一性**: Pie Chart とバッジの色を統一

## 技術的メモ
- ChartContainer の `className` で `aspect-square` と `max-h-[200px]` を組み合わせることで適切なサイズ調整が可能
- `tabular-nums` クラスで数字の幅を統一
- `justify-between` でアイテムを左右端に配置
- CSS変数ベースの色設定でテーマ対応

## 次回の改善点
- 将来的にはダークテーマ対応
- より多くのデータビジュアライゼーション機能の追加検討
- アニメーション効果の追加検討