/**
 * 権限管理ライブラリ
 * アプリケーション層での権限チェックを提供
 */

import { createClient } from '@supabase/supabase-js'
import { currentUser } from '@clerk/nextjs/server'
import type { Database } from '@/types/database'

// 管理者のメールアドレスリスト
const ADMIN_EMAILS = [
  'ibron1975@gmail.com',
  'yamamoto@iidzka.co.jp'
]

// Admin Supabaseクライアント
function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * ユーザーの権限情報を取得
 */
export async function getUserPermissions(userId: string) {
  const supabase = createAdminSupabaseClient()

  console.error('🔍 getUserPermissions: userId =', userId)

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('user_id, email, full_name, role, org_id')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('❌ プロファイル取得エラー:', error)
    console.error('  - Error code:', error.code)
    console.error('  - Error message:', error.message)
  }

  if (!profile) {
    console.error('❌ プロファイルが見つかりません。userId:', userId)
    console.error('📝 このuser_idでprofileを作成する必要があります')
    return null
  }

  console.error('✅ プロファイル取得成功:', { email: profile.email, role: profile.role })

  return {
    userId: profile.user_id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role || 'viewer',
    orgId: profile.org_id,
    isAdmin: profile.role === 'admin' || ADMIN_EMAILS.includes(profile.email || '')
  }
}

/**
 * 現在のユーザーの権限を取得
 */
export async function getCurrentUserPermissions() {
  const user = await currentUser()
  if (!user) {
    throw new Error('認証が必要です')
  }

  console.log('👤 Current User:', {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    firstName: user.firstName,
    lastName: user.lastName
  })

  const permissions = await getUserPermissions(user.id)
  if (!permissions) {
    // プロファイルが存在しない場合は自動作成を試みる
    console.error('⚠️ プロファイルが存在しないため、自動作成を試みます')
    console.error('📧 User email:', user.emailAddresses[0]?.emailAddress)
    console.error('🆔 User ID:', user.id)
    const created = await createProfileIfNotExists(user)
    console.error('✅ 自動作成結果:', created)
    if (created) {
      console.error('🔄 再度ユーザー権限を取得します')
      return await getUserPermissions(user.id)
    }
    console.error('❌ プロファイル自動作成に失敗しました')
    throw new Error('ユーザー情報が見つかりません')
  }

  return permissions
}

/**
 * プロファイルが存在しない場合は自動作成
 */
async function createProfileIfNotExists(user: any) {
  const supabase = createAdminSupabaseClient()
  const email = user.emailAddresses[0]?.emailAddress
  const orgId = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID

  console.error('🔧 環境変数チェック:')
  console.error('  - NEXT_PUBLIC_DEFAULT_ORG_ID:', orgId)
  console.error('  - Email:', email)

  if (!email || !orgId) {
    console.error('❌ メールアドレスまたは組織IDが見つかりません')
    console.error('  - Email exists:', !!email)
    console.error('  - OrgId exists:', !!orgId)
    return false
  }

  const role = isAdminEmail(email) ? 'admin' : 'viewer'

  console.error('📝 プロファイルを作成中:', {
    userId: user.id,
    email,
    role,
    orgId
  })

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      user_id: user.id,
      email: email,
      full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || email,
      role: role,
      org_id: orgId,
      created_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single()

  if (error) {
    console.error('❌ プロファイル作成エラー:', error)
    console.error('  - Error code:', error.code)
    console.error('  - Error message:', error.message)
    console.error('  - Error details:', error.details)
    return false
  }

  console.error('✅ プロファイル作成成功:', data)
  return true
}

/**
 * 管理者権限をチェック
 * @throws 権限がない場合はエラーをスロー
 */
export async function requireAdmin() {
  const permissions = await getCurrentUserPermissions()

  if (!permissions.isAdmin) {
    throw new Error('この操作には管理者権限が必要です')
  }

  return permissions
}

/**
 * 組織アクセス権限をチェック
 * @throws 権限がない場合はエラーをスロー
 */
export async function requireOrgAccess(orgId: string) {
  const permissions = await getCurrentUserPermissions()

  if (permissions.orgId !== orgId) {
    throw new Error('この組織へのアクセス権限がありません')
  }

  return permissions
}

/**
 * 管理者権限をチェック（Boolean返却）
 */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const permissions = await getCurrentUserPermissions()
    return permissions.isAdmin
  } catch {
    return false
  }
}

/**
 * メールアドレスが管理者かチェック
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email)
}

/**
 * ユーザーのロールを更新（管理者のみ実行可能）
 */
export async function updateUserRole(targetUserId: string, newRole: 'admin' | 'viewer') {
  // 操作者が管理者かチェック
  await requireAdmin()

  const supabase = createAdminSupabaseClient()

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('user_id', targetUserId)
    .select()
    .single()

  if (error) {
    throw new Error(`ロール更新に失敗しました: ${error.message}`)
  }

  return data
}

/**
 * プロファイルのロールを確実に設定
 * メールアドレスが管理者リストにある場合、自動的にadminロールを設定
 */
export async function ensureProfileRole(userId: string, email: string) {
  const supabase = createAdminSupabaseClient()

  const role = isAdminEmail(email) ? 'admin' : 'viewer'

  const { data, error } = await supabase
    .from('profiles')
    .update({ role, email })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('ロール設定エラー:', error)
  }

  return { role, updated: !error }
}
