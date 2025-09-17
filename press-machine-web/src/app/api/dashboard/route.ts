import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { getProductionGroupName } from '@/lib/productionGroups'

// Service Roleキーを使用したSupabaseクライアント
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

export async function GET() {
  try {
    // Clerk認証確認
    const user = await currentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminSupabaseClient()
    const orgId = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID not configured' },
        { status: 500 }
      )
    }

    // 総プレス機台数取得
    const { count: totalMachines, error: machineCountError } = await supabase
      .from('press_machines')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)

    if (machineCountError) {
      console.error('Machine count error:', machineCountError)
      throw machineCountError
    }

    // プレス機データ取得（種別・グループ集計用）
    const { data: machinesData, error: machinesError } = await supabase
      .from('press_machines')
      .select('machine_type, production_group, machine_number')
      .eq('org_id', orgId)

    if (machinesError) {
      console.error('Machines data error:', machinesError)
      throw machinesError
    }

    console.log('📊 Machines data:', machinesData?.length || 0, 'records')

    // 種別別集計
    const machinesByType = (machinesData as any[])?.reduce((acc: { [key: string]: number }, machine: any) => {
      acc[machine.machine_type] = (acc[machine.machine_type] || 0) + 1
      return acc
    }, {}) || {}

    // グループ別集計
    const machinesByGroup = (machinesData as any[])?.reduce((acc: { [key: string]: number }, machine: any) => {
      const group = getProductionGroupName(machine.production_group)
      acc[group] = (acc[group] || 0) + 1
      return acc
    }, {}) || {}

    // 総メンテナンス記録数
    const { count: totalMaintenance, error: maintenanceCountError } = await supabase
      .from('maintenance_records')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)

    if (maintenanceCountError) {
      console.error('Maintenance count error:', maintenanceCountError)
      throw maintenanceCountError
    }

    console.log('🔧 Total maintenance:', totalMaintenance)

    // 最近のメンテナンス記録（5件）
    const { data: recentMaintenanceData, error: recentMaintenanceError } = await supabase
      .from('maintenance_records')
      .select('id, maintenance_date, overall_judgment, press_id')
      .eq('org_id', orgId)
      .order('maintenance_date', { ascending: false })
      .limit(5)

    if (recentMaintenanceError) {
      console.error('Recent maintenance error:', recentMaintenanceError)
      throw recentMaintenanceError
    }

    // プレス機の番号を取得
    const recentMaintenance = []
    for (const record of (recentMaintenanceData as any[]) || []) {
      const { data: machineData, error: machineError } = await supabase
        .from('press_machines')
        .select('machine_number')
        .eq('id', record.press_id)
        .single()

      if (!machineError && machineData) {
        recentMaintenance.push({
          id: record.id,
          machine_number: machineData.machine_number,
          maintenance_date: record.maintenance_date,
          overall_judgment: record.overall_judgment
        })
      }
    }

    const dashboardData = {
      totalMachines: totalMachines || 0,
      machinesByType,
      machinesByGroup,
      totalMaintenance: totalMaintenance || 0,
      recentMaintenance
    }

    console.log('✅ Dashboard data ready:', {
      totalMachines: dashboardData.totalMachines,
      totalMaintenance: dashboardData.totalMaintenance,
      machineTypesCount: Object.keys(dashboardData.machinesByType).length,
      machineGroupsCount: Object.keys(dashboardData.machinesByGroup).length
    })

    return NextResponse.json(dashboardData)

  } catch (error: any) {
    console.error('❌ Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    )
  }
}