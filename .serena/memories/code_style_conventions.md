# Code Style and Conventions

## TypeScript/JavaScript
- **型定義**: 明示的な型定義を使用、anyは避ける
- **命名規則**:
  - コンポーネント: PascalCase (例: `MachineCard.tsx`)
  - 関数/変数: camelCase (例: `const getMachineData`)
  - 定数: UPPER_SNAKE_CASE (例: `const DEFAULT_ORG_ID`)
  - ファイル名: kebab-case (例: `machine-list.tsx`)

## React/Next.js
- **コンポーネント構成**:
  - 機能ベースのディレクトリ構造
  - Client Componentsは`'use client'`を明示
  - Server Componentsをデフォルトとする
- **Hooks**: カスタムフックは`use`プレフィックス
- **状態管理**: useStateとuseEffectの適切な使用

## フォームパターン
```typescript
// 1. Zodスキーマ定義
const schema = z.object({
  name: z.string().min(1, "必須項目"),
  // ...
})

// 2. React Hook Form使用
const form = useForm({
  resolver: zodResolver(schema)
})

// 3. shadcn/uiコンポーネント使用
```

## データベースクエリ
```typescript
// 必ずorg_idでフィルタリング
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('org_id', orgId)
```

## インポート順序
1. React/Next.js
2. 外部ライブラリ
3. 内部モジュール
4. 型定義
5. スタイル

## 言語
- UIテキスト: 日本語
- コード/コメント: 英語（必要時のみ）
- エラーメッセージ: 日本語

## コメント
- コメントは必要最小限
- 複雑なロジックのみ説明
- TODOコメントは具体的に記述