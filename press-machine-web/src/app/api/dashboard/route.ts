import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { getProductionGroupName } from '@/lib/productionGroups'
import { withTiming, PerformanceMetrics } from '@/lib/timing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Admin Supabase クライアント
function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function GET() {
  const t0 = performance.now()
  try {
    // 認証
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const orgId = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID
    if (!orgId) return NextResponse.json({ error: 'Organization ID not configured' }, { status: 500 })

    const supabase = createAdminSupabaseClient()

    // --- 並列に発行（直列待ちを撲滅）---
    const [
      totalMachinesRes,
      machinesDataRes,
      totalMaintenanceRes,
      recentMaintenanceRes,
    ] = await withTiming('DB Parallel Queries', async () => {
      return Promise.all([
        // 総プレス機台数（payload不要なので head:true + count）
        supabase
          .from('press_machines')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', orgId),

        // 集計用の機械データ（必要カラムのみ）
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
    }, 0.1) // 10%のリクエストでのみ計測

    // エラーチェック
    if (totalMachinesRes.error) throw totalMachinesRes.error
    if (machinesDataRes.error) throw machinesDataRes.error
    if (totalMaintenanceRes.error) throw totalMaintenanceRes.error
    if (recentMaintenanceRes.error) throw recentMaintenanceRes.error

    const totalMachines = totalMachinesRes.count ?? 0
    const machinesData = machinesDataRes.data ?? []
    const totalMaintenance = totalMaintenanceRes.count ?? 0
    const recentMaintenanceData = recentMaintenanceRes.data ?? []

    // --- JS側での軽量集計（必要なら後でRPC化）---
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

    // --- N+1排除：press_id を一括取得して機械番号を合成 ---
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

    const dashboardData = {
      totalMachines,
      machinesByType,
      machinesByGroup,
      totalMaintenance,
      recentMaintenance,
    }

    // Server-Timing（簡易）
    const t1 = performance.now()
    const totalDuration = Math.round(t1 - t0)

    // パフォーマンスメトリクス記録
    PerformanceMetrics.record('dashboard_api', totalDuration)

    // SLOチェック（400ms）
    if (totalDuration > 400) {
      console.warn(`⚠️ Dashboard API SLO exceeded: ${totalDuration}ms (target: 400ms)`)
    }

    const res = NextResponse.json(dashboardData, { status: 200 })
    res.headers.set('Server-Timing', `total;dur=${totalDuration}`)
    return res
  } catch (error: any) {
    console.error('❌ Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: String(error?.message || error) },
      { status: 500 }
    )
  }
}