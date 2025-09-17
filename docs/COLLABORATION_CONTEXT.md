# GPT-5 協力用コンテキストファイル

## 🤝 プロジェクト協力体制

**プロジェクト名**: Smart Press Monitor (プレス機スマート監視システム)  
**主担当**: Claude (Anthropic)  
**協力予定**: GPT-5  
**ユーザー**: CATIA  

---

## 📋 現在の開発状況サマリー

### ✅ 完成済み機能
1. **基盤システム**
   - Next.js 15.5.2 + React 19 セットアップ完了
   - Supabase データベース構築完了
   - TypeScript 型定義完備
   - Tailwind CSS + shadcn/ui 統合完了

2. **認証システム**
   - Supabase Auth Magic Link 実装完了
   - 認証フロー動作確認済み (http://localhost:3001)
   - `/auth/callback` 処理実装済み

3. **データベース**
   - 4つの主要テーブル設計完了 (orgs, profiles, press_machines, maintenance_records)
   - 33台のプレス機データ import済み
   - メンテナンス記録1件 import済み
   - RLS (Row Level Security) 設定済み

4. **UI/UXコンポーネント**
   - プレス機管理 CRUD 完全実装
   - メンテナンス記録管理実装
   - レスポンシブデザイン対応
   - 検索・フィルター機能

### 🔄 現在の課題・作業中項目
1. **認証プロバイダー問題**
   - 複雑なプロフィール取得でuseEffect無限ループ発生
   - 現在はシンプル認証プロバイダーで運用中
   - プロフィール情報が取得できないため一部機能制限

2. **データ表示問題**
   - orgsテーブルが空のため組織情報未設定
   - ユーザープロフィールの組織関連付けが不完全
   - 結果として `/machines`, `/maintenance` でデータ表示できない状況

3. **必要な修正作業**
   - 安全なプロフィール取得機能の実装
   - 組織の自動作成・割り当て機能
   - エラーハンドリングの改善

---

## 🎯 GPT-5に期待する協力内容

### 優先度 HIGH
1. **認証プロバイダーの修正**
   - useEffectの依存関係を適切に設定
   - 無限ループを回避しつつプロフィール情報を取得
   - メモリリーク防止とクリーンアップ処理

2. **組織管理システム**
   - デフォルト組織の自動作成機能
   - ユーザーの組織への自動割り当て
   - 組織ベースのデータフィルタリング

3. **データ表示の修復**
   - プレス機一覧でのデータ読み込み修正
   - メンテナンス記録一覧でのデータ読み込み修正

### 優先度 MEDIUM
1. **エラーハンドリング統一**
   - グローバルエラー処理システム
   - ユーザーフレンドリーなエラーメッセージ
   - Toast通知システム

2. **パフォーマンス最適化**
   - データ取得の最適化
   - React Re-render最小化
   - バンドルサイズ最適化

### 優先度 LOW
1. **新機能追加**
   - 分析・レポート機能 (`/analytics`)
   - ファイルアップロード機能
   - 通知システム

---

## 🔧 技術的制約・前提条件

### 既存コードベース
- **変更可能**: 認証プロバイダー、ページコンポーネント、UI改善
- **変更推奨しない**: データベーススキーマ、基本的なプロジェクト構造
- **変更禁止**: Supabase プロジェクト設定、環境変数、外部サービス連携

### 開発環境
- **OS**: Windows (WSL対応)
- **Node.js**: v18以降
- **ポート**: 3001 (Supabase認証設定済み)
- **ブラウザテスト**: Chrome/Edge推奨

### コーディング規約
- **TypeScript**: strict mode必須
- **ESLint**: Next.js推奨設定
- **コメント**: 日本語OK、重要な部分のみ
- **命名**: camelCase (React), kebab-case (CSS), snake_case (DB)

---

## 📁 重要なファイル一覧

### 最優先で理解すべきファイル
```
src/components/auth/AuthProvider-simple.tsx        # 現在使用中の認証プロバイダー
src/components/auth/AuthProvider-with-profile.tsx  # 問題のあるプロバイダー
src/app/layout.tsx                                 # レイアウト設定
src/app/page.tsx                                   # ダッシュボード
src/types/database.ts                              # 型定義
```

### データ関連
```
press_machine.db                                   # ローカルSQLiteデータ
*.csv                                              # インポート済みデータ
supabase_*.sql                                     # スキーマ設定
```

### 設定ファイル
```
.env.local                                         # 環境変数
package.json                                       # 依存関係
next.config.ts, tailwind.config.ts                # 設定
```

---

## 🚨 注意事項・制限事項

### 絶対に避けること
- Supabase プロジェクトの削除・再作成
- 既存データの削除
- 環境変数の変更
- ポート番号の変更 (3001固定)

### 慎重に扱うもの
- データベーススキーマの変更
- RLS ポリシーの変更
- 認証フローの根本的変更

### 推奨アプローチ
- 段階的な機能追加
- 既存機能を壊さない修正
- 十分なログ出力でデバッグ
- コンソールエラーの完全解消

---

## 🔍 現在のエラー・問題詳細

### 1. 認証プロバイダー無限ループ
```typescript
// 問題箇所: AuthProvider-with-profile.tsx
useEffect(() => {
  // loadProfile関数がuseEffect内で定義されている
  // 依存配列にsupabaseが含まれる
  // → 毎回新しい関数オブジェクトが作成される
  // → 無限レンダリング発生
}, [user, profile?.org_id, supabase]) // ← ここが問題
```

### 2. データ表示エラー
```javascript
// machines/page.tsx でのエラー
// profile.org_id が undefined のため SQL WHERE句でエラー
const { data: machines } = await supabase
  .from('press_machines')
  .select('*')
  .eq('org_id', profile.org_id) // ← profile.org_id が null
```

### 3. 組織データ不整合
```sql
-- 問題: orgsテーブルが空
SELECT * FROM orgs; -- 結果: 0件

-- プレス機データには組織IDが存在
SELECT DISTINCT org_id FROM press_machines;
-- 結果: 'c897453e-14c7-4335-bdb4-91978778d95b'

-- しかしorgsテーブルに該当レコードなし
```

---

## 🎯 成功の定義

### 短期目標 (1-2日以内)
- [ ] ダッシュボードが正常表示される
- [ ] プレス機一覧でデータが表示される
- [ ] メンテナンス記録でデータが表示される
- [ ] 無限ローディングが解消される

### 中期目標 (1週間以内)
- [ ] 新規プレス機登録が動作する
- [ ] メンテナンス記録登録が動作する
- [ ] データの編集・削除が動作する
- [ ] エラーハンドリングが適切に動作する

### 長期目標 (1ヶ月以内)
- [ ] 分析・レポート機能実装
- [ ] パフォーマンス最適化
- [ ] ユーザビリティ改善
- [ ] 本番環境デプロイ準備

---

## 📞 コミュニケーション

### Claudeへの引き継ぎ情報
- すべての変更は段階的に実装済み
- コンソールログで詳細なデバッグ情報出力中
- 問題発生時は即座にシンプル版への切り戻し可能

### ユーザー (CATIA) への報告
- 技術的詳細は TECHNICAL_DETAILS.md 参照
- 進捗状況は CURRENT_SPECIFICATION.md で確認
- 問題発生時は具体的なエラーメッセージを共有

---

**このファイルの目的**: GPT-5が迅速にプロジェクト状況を理解し、効果的な協力ができるよう必要な情報を集約

*作成日時: 2025年9月3日 09:44*  
*作成者: Claude (Anthropic)*