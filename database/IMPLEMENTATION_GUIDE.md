# RLS再有効化 実装ガイド

## 概要

このガイドでは、Row Level Security (RLS) の再有効化手順を説明します。

## アーキテクチャ

### アプローチ: アプリケーション層での権限チェック

**選択理由:**
- Clerk認証とSupabase RLSの統合が複雑
- アプリケーション層でのチェックがより確実
- RLSは補助的なセキュリティ層として機能

**実装済みコンポーネント:**
1. `lib/permissions.ts` - 権限管理ライブラリ
2. `app/machines/actions.ts` - 機械管理Server Actions（権限チェック追加済み）
3. `app/maintenance/actions.ts` - メンテナンス管理Server Actions（権限チェック追加済み）
4. `database/enable_rls_with_roles.sql` - RLS有効化SQLスクリプト
5. `database/test_rls_with_roles.sql` - テストスクリプト

## 実装手順

### ステップ1: データベースの準備

```bash
# Supabase SQLエディターで実行
psql -f database/enable_rls_with_roles.sql
```

このスクリプトは以下を実行します:
1. `profiles`テーブルに`role`カラムを追加
2. 管理者ユーザー（ibron1975@gmail.com, yamamoto@iidzka.co.jp）を設定
3. Clerk用ヘルパー関数の作成
4. 権限ベースRLSポリシーの作成
5. RLSの再有効化

### ステップ2: 動作確認

```bash
# テストスクリプトの実行
psql -f database/test_rls_with_roles.sql
```

確認項目:
- ✅ RLSが有効化されている
- ✅ 管理者ユーザーのroleが'admin'に設定されている
- ✅ その他のユーザーのroleが'viewer'に設定されている

### ステップ3: アプリケーションの動作確認

#### 管理者ユーザーでテスト（ibron1975@gmail.com または yamamoto@iidzka.co.jp）

1. ログイン
2. プレス機一覧ページを表示
3. **新規作成**ボタンが表示される
4. プレス機を新規作成できる
5. プレス機を編集できる
6. プレス機を削除できる
7. メンテナンス記録を作成/編集/削除できる

#### 閲覧ユーザーでテスト（その他のメールアドレス）

1. ログイン
2. プレス機一覧ページを表示
3. データは閲覧できる
4. **新規作成/編集/削除を試みるとエラー**が表示される
5. エラーメッセージ: 「この操作には管理者権限が必要です」

### ステップ4: フロントエンドのUI調整（オプション）

閲覧ユーザーには編集ボタンを非表示にすることを推奨:

```typescript
// 例: machines/page.tsx
import { checkIsAdmin } from '@/lib/permissions'

export default async function MachinesPage() {
  const isAdmin = await checkIsAdmin()

  return (
    <div>
      {isAdmin && (
        <Button onClick={() => router.push('/machines/new')}>
          新規作成
        </Button>
      )}
    </div>
  )
}
```

## 権限システムの仕様

### ロール定義

| ロール | 権限 | 対象ユーザー |
|--------|------|--------------|
| `admin` | 全操作可能（作成/編集/削除/閲覧） | ibron1975@gmail.com, yamamoto@iidzka.co.jp |
| `viewer` | 閲覧のみ | その他すべてのユーザー |

### 権限チェックの実装

```typescript
// lib/permissions.ts

// 管理者権限が必要な操作
export async function requireAdmin() {
  const permissions = await getCurrentUserPermissions()

  if (!permissions.isAdmin) {
    throw new Error('この操作には管理者権限が必要です')
  }

  return permissions
}

// 組織アクセス権限が必要な操作
export async function requireOrgAccess(orgId: string) {
  const permissions = await getCurrentUserPermissions()

  if (permissions.orgId !== orgId) {
    throw new Error('この組織へのアクセス権限がありません')
  }

  return permissions
}
```

### Server Actionsでの使用

```typescript
// app/machines/actions.ts

export async function createPressMachine(data: MachineData) {
  try {
    // 管理者権限チェック（admin以外はここでエラー）
    const permissions = await requireAdmin()

    const supabase = createAdminSupabaseClient()

    const { data: newMachine, error } = await supabase
      .from('press_machines')
      .insert({
        ...data,
        org_id: permissions.orgId!
      })

    // ... 以降の処理
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
}
```

## RLSポリシーの詳細

### profiles テーブル

```sql
-- 閲覧: 自分のプロファイルのみ
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (user_id = auth.clerk_user_id());
```

### press_machines テーブル

```sql
-- 閲覧: 同じ組織の全ユーザー
CREATE POLICY "press_machines_select" ON press_machines
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.clerk_user_id()
        AND org_id = press_machines.org_id
    )
  );

-- 挿入/更新/削除: adminロールのみ
CREATE POLICY "press_machines_insert" ON press_machines
  FOR INSERT
  WITH CHECK (
    auth.is_admin() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.clerk_user_id()
        AND org_id = press_machines.org_id
    )
  );
```

## トラブルシューティング

### 問題: 管理者でも編集できない

**確認事項:**
1. ユーザーのロールが正しく設定されているか
   ```sql
   SELECT user_id, email, role FROM profiles WHERE email = 'your-email@example.com';
   ```

2. `lib/permissions.ts`のADMIN_EMAILSリストに含まれているか
   ```typescript
   const ADMIN_EMAILS = [
     'ibron1975@gmail.com',
     'yamamoto@iidzka.co.jp'
   ]
   ```

3. ブラウザのコンソールでエラーを確認

### 問題: 閲覧ユーザーでも編集できてしまう

**確認事項:**
1. Server Actionsが最新版か確認
   ```bash
   git status
   # machines/actions.ts と maintenance/actions.ts が更新されているか
   ```

2. アプリケーションを再起動
   ```bash
   npm run dev
   ```

3. ブラウザのキャッシュをクリア

### 問題: データが全く表示されない

**確認事項:**
1. RLSが正しく有効化されているか
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables
   WHERE tablename IN ('press_machines', 'maintenance_records');
   ```

2. ユーザーのorg_idが設定されているか
   ```sql
   SELECT user_id, email, org_id FROM profiles;
   ```

3. 環境変数が正しく設定されているか
   ```bash
   # .env.local
   NEXT_PUBLIC_DEFAULT_ORG_ID=your-org-id
   ```

## セキュリティ考慮事項

### 多層防御アプローチ

1. **アプリケーション層** (第1層)
   - `lib/permissions.ts`での権限チェック
   - Server Actionsでの検証

2. **RLS層** (第2層・補助)
   - データベースレベルでの最後の砦
   - アプリケーションバグがあっても保護

3. **組織分離**
   - すべてのクエリでorg_idフィルタリング
   - マルチテナントの完全分離

### 推奨事項

- ✅ 定期的な権限監査
- ✅ アクセスログの記録
- ✅ エラーメッセージは詳細すぎないように
- ✅ 本番環境では常にRLS有効化
- ✅ Service Role Keyの使用は最小限に

## メンテナンス

### 新しい管理者の追加

```sql
-- 1. プロファイルのロールを更新
UPDATE profiles
SET role = 'admin'
WHERE email = 'new-admin@example.com';

-- 2. lib/permissions.tsのADMIN_EMAILSリストに追加
const ADMIN_EMAILS = [
  'ibron1975@gmail.com',
  'yamamoto@iidzka.co.jp',
  'new-admin@example.com'  -- 追加
]
```

### ユーザーのロール変更

```typescript
// 管理者として実行
import { updateUserRole } from '@/lib/permissions'

await updateUserRole('user-id-here', 'admin')  // 管理者に昇格
await updateUserRole('user-id-here', 'viewer') // 閲覧者に降格
```

## 完了チェックリスト

- [ ] `database/enable_rls_with_roles.sql`を実行
- [ ] `database/test_rls_with_roles.sql`でテスト
- [ ] 管理者ユーザーでログインして全機能が動作することを確認
- [ ] 閲覧ユーザーでログインして編集操作がブロックされることを確認
- [ ] ブラウザコンソールでエラーが出ていないことを確認
- [ ] RLSが有効化されていることをSupabaseダッシュボードで確認
- [ ] 本番環境にデプロイ前にステージング環境でテスト

## 次のステップ

RLS再有効化が完了したら、次のタスクに進みます:
1. console.log文の置換（ロギングシステム実装）
2. TypeScript型安全性の改善
3. 未使用ファイルのクリーンアップ
