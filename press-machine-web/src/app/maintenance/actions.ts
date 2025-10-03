'use server'

import { revalidatePath } from 'next/cache'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Admin Supabaseクライアント（SERVICE_ROLE_KEY使用でRLSバイパス）
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

// 認証チェックヘルパー
async function checkAuth() {
  const user = await currentUser()
  if (!user) {
    throw new Error('認証が必要です')
  }

  const orgId = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID
  if (!orgId) {
    throw new Error('組織IDが設定されていません')
  }

  return { userId: user.id, orgId }
}

export async function createMaintenanceRecord(data: {
  pressId: number
  maintenanceDate: string
  overallJudgment: string
  clutchValveReplacement: string
  brakeValveReplacement: string
  remarks?: string | null
}) {
  try {
    const auth = await checkAuth()
    const supabase = createAdminSupabaseClient()

    const { data: newRecord, error } = await supabase
      .from('maintenance_records')
      .insert({
        press_id: data.pressId,
        maintenance_date: data.maintenanceDate,
        overall_judgment: data.overallJudgment,
        clutch_valve_replacement: data.clutchValveReplacement,
        brake_valve_replacement: data.brakeValveReplacement,
        remarks: data.remarks,
        org_id: auth.orgId,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ メンテナンス記録作成エラー:', error)
      return { success: false, error: error.message || 'メンテナンス記録の作成に失敗しました' }
    }

    revalidatePath('/maintenance')
    revalidatePath(`/machines/${data.pressId}`)
    revalidatePath('/')

    return { success: true, data: newRecord }
  } catch (error: any) {
    console.error('❌ メンテナンス記録作成エラー:', error)
    return { success: false, error: error.message || 'メンテナンス記録の作成に失敗しました' }
  }
}

export async function updateMaintenanceRecord(
  id: number,
  data: {
    maintenanceDate: string
    overallJudgment: string
    clutchValveReplacement: string
    brakeValveReplacement: string
    remarks?: string | null
  }
) {
  try {
    const auth = await checkAuth()
    const supabase = createAdminSupabaseClient()

    const { data: updatedRecord, error } = await supabase
      .from('maintenance_records')
      .update({
        maintenance_date: data.maintenanceDate,
        overall_judgment: data.overallJudgment,
        clutch_valve_replacement: data.clutchValveReplacement,
        brake_valve_replacement: data.brakeValveReplacement,
        remarks: data.remarks,
      })
      .eq('id', id)
      .eq('org_id', auth.orgId)
      .select()
      .single()

    if (error) {
      console.error('❌ メンテナンス記録更新エラー:', error)
      return { success: false, error: error.message || 'メンテナンス記録の更新に失敗しました' }
    }

    revalidatePath('/maintenance')
    revalidatePath(`/maintenance/${id}`)
    revalidatePath('/')

    return { success: true, data: updatedRecord }
  } catch (error: any) {
    console.error('❌ メンテナンス記録更新エラー:', error)
    return { success: false, error: error.message || 'メンテナンス記録の更新に失敗しました' }
  }
}

export async function deleteMaintenanceRecord(id: number) {
  try {
    const auth = await checkAuth()
    const supabase = createAdminSupabaseClient()

    const { error } = await supabase
      .from('maintenance_records')
      .delete()
      .eq('id', id)
      .eq('org_id', auth.orgId)

    if (error) {
      console.error('❌ メンテナンス記録削除エラー:', error)
      return { success: false, error: error.message || 'メンテナンス記録の削除に失敗しました' }
    }

    revalidatePath('/maintenance')
    revalidatePath('/')

    return { success: true }
  } catch (error: any) {
    console.error('❌ メンテナンス記録削除エラー:', error)
    return { success: false, error: error.message || 'メンテナンス記録の削除に失敗しました' }
  }
}
