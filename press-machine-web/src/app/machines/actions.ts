'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { requireAdmin } from '@/lib/permissions'

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

export async function createPressMachine(data: {
  machineNumber: string
  equipmentNumber?: string | null
  manufacturer?: string | null
  modelType?: string | null
  serialNumber?: string | null
  machineType: string
  productionGroup: number
  tonnage?: number | null
}) {
  try {
    // 管理者権限チェック
    const permissions = await requireAdmin()
    const supabase = createAdminSupabaseClient()

    const { data: newMachine, error } = await supabase
      .from('press_machines')
      .insert({
        machine_number: data.machineNumber,
        equipment_number: data.equipmentNumber,
        manufacturer: data.manufacturer,
        model_type: data.modelType,
        serial_number: data.serialNumber,
        machine_type: data.machineType,
        production_group: data.productionGroup,
        tonnage: data.tonnage,
        org_id: permissions.orgId!,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ プレス機作成エラー:', error)

      // エラーコード23505は一意制約違反
      if (error.code === '23505') {
        // machine_numberの重複かidの重複かを判別
        if (error.details?.includes('machine_number')) {
          return { success: false, error: 'この機械番号は既に登録されています' }
        }
        // idの重複の場合はより詳細なエラーメッセージ
        return { success: false, error: 'データベースエラーが発生しました。管理者に連絡してください。' }
      }

      return { success: false, error: error.message || 'プレス機の作成に失敗しました' }
    }

    revalidatePath('/machines')
    revalidatePath('/')

    return { success: true, data: newMachine }
  } catch (error: any) {
    console.error('❌ プレス機作成エラー:', error)
    return { success: false, error: error.message || 'プレス機の作成に失敗しました' }
  }
}

export async function updatePressMachine(
  id: number,
  data: {
    machineNumber: string
    equipmentNumber?: string | null
    manufacturer?: string | null
    modelType?: string | null
    serialNumber?: string | null
    machineType: string
    productionGroup: number
    tonnage?: number | null
  }
) {
  try {
    // 管理者権限チェック
    const permissions = await requireAdmin()
    const supabase = createAdminSupabaseClient()

    const { data: updatedMachine, error } = await supabase
      .from('press_machines')
      .update({
        machine_number: data.machineNumber,
        equipment_number: data.equipmentNumber,
        manufacturer: data.manufacturer,
        model_type: data.modelType,
        serial_number: data.serialNumber,
        machine_type: data.machineType,
        production_group: data.productionGroup,
        tonnage: data.tonnage,
      })
      .eq('id', id)
      .eq('org_id', permissions.orgId!)
      .select()
      .single()

    if (error) {
      console.error('❌ プレス機更新エラー:', error)

      if (error.code === '23505' && error.details?.includes('machine_number')) {
        return { success: false, error: 'この機械番号は既に登録されています' }
      }

      return { success: false, error: error.message || 'プレス機の更新に失敗しました' }
    }

    revalidatePath('/machines')
    revalidatePath(`/machines/${id}`)
    revalidatePath('/')

    return { success: true, data: updatedMachine }
  } catch (error: any) {
    console.error('❌ プレス機更新エラー:', error)
    return { success: false, error: error.message || 'プレス機の更新に失敗しました' }
  }
}

export async function deletePressMachine(id: number) {
  try {
    // 管理者権限チェック
    const permissions = await requireAdmin()
    const supabase = createAdminSupabaseClient()

    const { error } = await supabase
      .from('press_machines')
      .delete()
      .eq('id', id)
      .eq('org_id', permissions.orgId!)

    if (error) {
      console.error('❌ プレス機削除エラー:', error)
      return { success: false, error: error.message || 'プレス機の削除に失敗しました' }
    }

    revalidatePath('/machines')
    revalidatePath('/')

    return { success: true }
  } catch (error: any) {
    console.error('❌ プレス機削除エラー:', error)
    return { success: false, error: error.message || 'プレス機の削除に失敗しました' }
  }
}
