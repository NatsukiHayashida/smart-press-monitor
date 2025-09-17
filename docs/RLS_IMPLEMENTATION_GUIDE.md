# RLS（Row Level Security）実装ガイド

## 📋 概要

このガイドでは、Smart Press MonitorアプリケーションにClerk認証と連携したRLS（Row Level Security）を実装する手順を説明します。

## 🎯 目的

- **データの安全性向上**: ユーザーは自分の組織のデータのみアクセス可能
- **マルチテナント対応**: 組織間でデータを完全に分離
- **セキュリティ強化**: データベースレベルでアクセス制御を実施

## 🔐 実装アーキテクチャ

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Clerk     │────▶│  Next.js    │────▶│   Supabase   │
│   Auth      │     │  App        │     │   Database   │
└─────────────┘     └─────────────┘     └──────────────┘
      │                    │                     │
      │                    │                     │
   User ID             Custom Headers         RLS Policies
                    (x-clerk-user-id)     (get_clerk_user_id())
```

## 📁 作成したファイル

1. **`database/enable_rls_with_clerk.sql`**
   - RLSポリシーの実装SQLスクリプト
   - Clerk認証用の関数定義
   - 各テーブルのポリシー設定

2. **`database/test_rls_policies.sql`**
   - RLSポリシーのテストクエリ
   - 現在の状態確認用スクリプト
   - パフォーマンステスト

3. **`src/lib/supabase-clerk.ts`**
   - カスタムヘッダー付きSupabaseクライアント
   - ClerkユーザーIDの自動送信

## 🚀 実装手順

### Step 1: Service Role Keyの取得と設定

1. Supabaseダッシュボードにログイン
2. Settings → API → service_role キーをコピー
3. `.env.local`ファイルに追加:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**⚠️ 警告**: Service Role Keyは絶対に公開しないでください。`.gitignore`に含まれていることを確認してください。

### Step 2: 現在の状態を確認

RLSを有効化する前に、現在のデータベース状態を確認します：

```bash
# Supabase SQL Editorで実行
# test_rls_policies.sqlの内容を実行
```

以下を確認：
- 現在のRLS状態（有効/無効）
- 既存のポリシー
- データ件数のベースライン

### Step 3: RLSポリシーの適用

**⚠️ 重要**: 本番環境に適用する前に、必ず開発環境でテストしてください。

```sql
-- Supabase SQL Editorで実行
-- enable_rls_with_clerk.sqlの内容を実行
```

このスクリプトは以下を実行します：
1. Clerk認証用の関数作成（`get_clerk_user_id()`など）
2. 各テーブルでRLSを有効化
3. 組織ベースのアクセスポリシーを設定

### Step 4: アプリケーションの更新確認

Supabaseクライアントがカスタムヘッダーを送信することを確認：

```typescript
// src/lib/supabase-clerk.ts
// 以下のヘッダーが自動的に送信される
{
  'x-clerk-user-id': userId || '',
  'x-clerk-org-id': orgId || '',
}
```

### Step 5: 動作テスト

開発環境で以下をテスト：

1. **ログインテスト**
   - ユーザーがログインできることを確認
   - 自分の組織のデータのみ表示されることを確認

2. **データアクセステスト**
   - プレス機一覧が正しく表示される
   - メンテナンス記録が正しく表示される
   - 他の組織のデータが表示されない

3. **CRUD操作テスト**
   - 新規作成（INSERT）
   - 更新（UPDATE）
   - 削除（DELETE）
   - 読み取り（SELECT）

## 🧪 テスト方法

### 基本的なテスト

```sql
-- Supabase SQL Editorで実行

-- 1. 関数の動作確認
SELECT 
  get_clerk_user_id() AS clerk_user_id,
  get_clerk_org_id() AS clerk_org_id,
  is_service_role() AS is_service_role;

-- 2. RLS有効状態の確認
SELECT 
  tablename,
  rowsecurity,
  CASE 
    WHEN rowsecurity = true THEN '✅ 有効'
    ELSE '❌ 無効'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'organizations', 'press_machines', 'maintenance_records');
```

### アプリケーションでのテスト

1. ブラウザの開発者ツールを開く
2. Networkタブで`supabase.co`へのリクエストを確認
3. Request Headersに`x-clerk-user-id`が含まれていることを確認

## ⚡ パフォーマンス最適化

RLS適用後のパフォーマンスを最適化するための推奨事項：

### インデックスの追加

```sql
-- org_idカラムにインデックスを作成（まだない場合）
CREATE INDEX IF NOT EXISTS idx_press_machines_org_id ON press_machines(org_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_org_id ON maintenance_records(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON profiles(org_id);
```

### クエリの最適化

```typescript
// ❌ 非効率的
const { data } = await supabase
  .from('press_machines')
  .select('*')
  // RLSが自動的にフィルタリング

// ✅ 効率的（明示的なフィルタ）
const { data } = await supabase
  .from('press_machines')
  .select('*')
  .eq('org_id', orgId) // 明示的なフィルタで高速化
```

## 🔧 トラブルシューティング

### 問題: データが表示されない

**原因**: カスタムヘッダーが送信されていない

**解決策**:
1. ブラウザのコンソールでエラーを確認
2. Networkタブでヘッダーを確認
3. `useSupabaseClient()`が正しく使用されているか確認

### 問題: 401/403エラー

**原因**: RLSポリシーが厳しすぎる

**解決策**:
1. Service Role Keyを使用して一時的にバイパス
2. ポリシーを確認して調整
3. テストユーザーのorg_idを確認

### 問題: パフォーマンスが低下

**原因**: インデックスが不足

**解決策**:
1. EXPLAINクエリで実行計画を確認
2. 必要なインデックスを追加
3. クエリを最適化

## 📊 監視とメンテナンス

### ログの確認

Supabaseダッシュボード → Logs でRLS関連のエラーを監視：

- 認証失敗
- ポリシー違反
- パフォーマンス問題

### 定期的な確認

月次で以下を確認：

1. アクセスログの異常パターン
2. パフォーマンスメトリクス
3. セキュリティ監査ログ

## 🚨 セキュリティベストプラクティス

1. **Service Role Keyの管理**
   - 環境変数で管理
   - 本番環境では環境変数管理サービス使用
   - 定期的にローテーション

2. **最小権限の原則**
   - 必要最小限のアクセス権限のみ付与
   - 管理者権限は別途管理

3. **監査ログ**
   - 重要な操作はログに記録
   - 定期的に監査

4. **バックアップ**
   - RLS適用前に必ずバックアップ
   - 定期的な自動バックアップ設定

## 📝 チェックリスト

RLS実装前：
- [ ] 本番データのバックアップ完了
- [ ] Service Role Key設定完了
- [ ] 開発環境でのテスト完了
- [ ] パフォーマンステスト実施

RLS実装後：
- [ ] すべてのユーザーがログイン可能
- [ ] データアクセスが正常
- [ ] CRUD操作が正常
- [ ] パフォーマンス問題なし
- [ ] エラーログなし

## 🎯 まとめ

RLSの実装により、以下が実現されます：

1. **データセキュリティ**: データベースレベルでの強固なアクセス制御
2. **マルチテナント対応**: 組織間でのデータ完全分離
3. **コンプライアンス**: データ保護規制への対応
4. **スケーラビリティ**: 組織数が増えても安全性を維持

実装後は定期的な監視とメンテナンスを行い、セキュリティを維持してください。