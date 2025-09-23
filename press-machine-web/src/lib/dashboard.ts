/**
 * ダッシュボードデータ取得（サーバーサイド直接呼び出し用）
 * API経由のHTTPオーバーヘッドを削減
 */
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { getProductionGroupName } from '@/lib/productionGroups'
import { withTiming } from '@/lib/timing'

// Admin Supabase クライアント
function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export interface DashboardData {
  totalMachines: number
  machinesByType: Record<string, number>
  machinesByGroup: Record<string, number>
  totalMaintenance: number
  recentMaintenance: Array<{
    id: number
    machine_number: string | null
    maintenance_date: string
    overall_judgment: string
  }>
}

/**
 * ダッシュボードデータを直接取得（API経由なし）
 * ページからの直接呼び出し用
 */
export async function getDashboardData(): Promise<DashboardData> {
  const orgId = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID
  if (!orgId) {
    throw new Error('Organization ID not configured')
  }

  const supabase = createAdminSupabaseClient()

  // --- 並列に発行（直列待ちを撲滅）---
  const [
    totalMachinesRes,
    machinesDataRes,
    totalMaintenanceRes,
    recentMaintenanceRes,
  ] = await withTiming('Dashboard Direct Query', async () => {
    return Promise.all([
      // 総プレス機台数
      supabase
        .from('press_machines')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId),

      // 集計用の機械データ
      supabase
        .from('press_machines')
        .select('machine_type, production_group, machine_number')
        .eq('org_id', orgId),

      // 総メンテ記録数
      supabase
        .from('maintenance_records')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId),

      // 最近のメンテ記録（5件）
      supabase
        .from('maintenance_records')
        .select('id, maintenance_date, overall_judgment, press_id')
        .eq('org_id', orgId)
        .order('maintenance_date', { ascending: false })
        .limit(5),
    ])
  }, 0.05) // 5%サンプリング

  // エラーチェック
  if (totalMachinesRes.error) throw totalMachinesRes.error
  if (machinesDataRes.error) throw machinesDataRes.error
  if (totalMaintenanceRes.error) throw totalMaintenanceRes.error
  if (recentMaintenanceRes.error) throw recentMaintenanceRes.error

  const totalMachines = totalMachinesRes.count ?? 0
  const machinesData = machinesDataRes.data ?? []
  const totalMaintenance = totalMaintenanceRes.count ?? 0
  const recentMaintenanceData = recentMaintenanceRes.data ?? []

  // JS側での軽量集計
  const machinesByType = machinesData.reduce<Record<string, number>>((acc, m: any) => {
    const key = m.machine_type ?? '未分類'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const machinesByGroup = machinesData.reduce<Record<string, number>>((acc, m: any) => {
    const key = getProductionGroupName(m.production_group)
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  // N+1排除：press_id を一括取得
  const pressIds = Array.from(
    new Set(recentMaintenanceData.map((r: any) => r.press_id).filter(Boolean))
  )

  let machineNumbersMap = new Map<number, string>()
  if (pressIds.length > 0) {
    const { data: machinesForRecent, error: machinesForRecentErr } = await supabase
      .from('press_machines')
      .select('id, machine_number')
      .in('id', pressIds)

    if (machinesForRecentErr) throw machinesForRecentErr
    machinesForRecent?.forEach((m: any) => {
      machineNumbersMap.set(m.id, m.machine_number)
    })
  }

  const recentMaintenance = recentMaintenanceData.map((rec: any) => ({
    id: rec.id,
    machine_number: machineNumbersMap.get(rec.press_id) ?? null,
    maintenance_date: rec.maintenance_date,
    overall_judgment: rec.overall_judgment,
  }))

  return {
    totalMachines,
    machinesByType,
    machinesByGroup,
    totalMaintenance,
    recentMaintenance,
  }
}