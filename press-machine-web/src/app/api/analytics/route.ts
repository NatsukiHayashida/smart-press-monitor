import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { getProductionGroupName } from '@/lib/productionGroups'

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

    // --- 並列クエリでN+1を排除 ---
    const [
      totalMachinesRes,
      machinesDataRes,
      totalMaintenanceRes,
      allMaintenanceRecordsRes,
      valveDataRes,
    ] = await Promise.all([
      // 総プレス機台数
      supabase
        .from('press_machines')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId),

      // 集計用の機械データ
      supabase
        .from('press_machines')
        .select('id, machine_number, machine_type, production_group')
        .eq('org_id', orgId),

      // 総メンテ記録数
      supabase
        .from('maintenance_records')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId),

      // 全メンテナンス記録（press_idと日付のみ）- N+1排除
      supabase
        .from('maintenance_records')
        .select('press_id, maintenance_date')
        .eq('org_id', orgId)
        .order('maintenance_date', { ascending: false }),

      // 電磁弁交換データ
      supabase
        .from('maintenance_records')
        .select('clutch_valve_replacement, brake_valve_replacement')
        .eq('org_id', orgId),
    ])

    // エラーチェック
    if (totalMachinesRes.error) throw totalMachinesRes.error
    if (machinesDataRes.error) throw machinesDataRes.error
    if (totalMaintenanceRes.error) throw totalMaintenanceRes.error
    if (allMaintenanceRecordsRes.error) throw allMaintenanceRecordsRes.error
    if (valveDataRes.error) throw valveDataRes.error

    const totalMachines = totalMachinesRes.count ?? 0
    const machinesData = machinesDataRes.data ?? []
    const totalMaintenance = totalMaintenanceRes.count ?? 0
    const allMaintenanceRecords = allMaintenanceRecordsRes.data ?? []
    const valveData = valveDataRes.data ?? []

    // --- JS側で軽量集計 ---
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

    // N+1排除：press_idでグループ化して最新日付を取得（ループなし）
    const latestMaintenanceMap = new Map<number, string>()
    allMaintenanceRecords.forEach((record: any) => {
      const pressId = record.press_id
      const date = record.maintenance_date
      if (!latestMaintenanceMap.has(pressId) || latestMaintenanceMap.get(pressId)! < date) {
        latestMaintenanceMap.set(pressId, date)
      }
    })

    const latestMaintenanceByMachine = machinesData.map((machine: any) => ({
      machine_number: machine.machine_number,
      latest_maintenance: latestMaintenanceMap.get(machine.id) || null,
    }))

    // 電磁弁交換統計
    const clutchCount = valveData.filter((v: any) => v.clutch_valve_replacement === '実施').length
    const brakeCount = valveData.filter((v: any) => v.brake_valve_replacement === '実施').length

    const analyticsData = {
      totalMachines,
      machinesByType,
      machinesByGroup,
      totalMaintenance,
      latestMaintenanceByMachine,
      valveReplacements: {
        clutch: clutchCount,
        brake: brakeCount,
      },
    }

    const t1 = performance.now()
    const totalDuration = Math.round(t1 - t0)

    // SLOチェック（400ms）
    if (totalDuration > 400) {
      console.warn(`⚠️ Analytics API SLO exceeded: ${totalDuration}ms (target: 400ms)`)
    } else {
      console.log(`✅ Analytics API completed in ${totalDuration}ms`)
    }

    const res = NextResponse.json(analyticsData, { status: 200 })
    res.headers.set('Server-Timing', `total;dur=${totalDuration}`)
    res.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=600')
    return res
  } catch (error: any) {
    console.error('❌ Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data', details: String(error?.message || error) },
      { status: 500 }
    )
  }
}
