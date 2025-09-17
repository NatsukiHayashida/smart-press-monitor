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
    // 環境変数デバッグ
    console.log('🔧 Environment variables check:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing')
    console.log('- NEXT_PUBLIC_DEFAULT_ORG_ID:', process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || 'Missing')

    // Clerk認証確認
    const user = await currentUser()

    if (!user) {
      console.log('❌ No authenticated user found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔐 Clerk User ID:', user.id)
    console.log('🔐 Clerk User Email:', user.emailAddresses[0]?.emailAddress)

    const supabase = createAdminSupabaseClient()
    const orgId = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID

    if (!orgId) {
      console.log('❌ Organization ID not configured')
      return NextResponse.json(
        { error: 'Organization ID not configured' },
        { status: 500 }
      )
    }

    console.log('🏢 Using orgId:', orgId)

    // Supabase接続テスト
    console.log('🔌 Testing Supabase connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('orgs')
      .select('id, name')
      .limit(1)

    if (connectionError) {
      console.error('❌ Supabase connection failed:', connectionError)
      return NextResponse.json(
        { error: 'Database connection failed', details: connectionError.message },
        { status: 500 }
      )
    }

    console.log('✅ Supabase connection successful, orgs sample:', connectionTest)

    // 全プレス機台数確認（org_idフィルタなし）
    console.log('🔍 Checking total machines in database (without org filter)...')
    const { count: totalMachinesAll, error: allMachinesError } = await supabase
      .from('press_machines')
      .select('*', { count: 'exact', head: true })

    console.log('📊 Total machines in DB (all):', totalMachinesAll, 'Error:', allMachinesError)

    // org_idでの検索
    console.log(`🔍 Checking machines for org_id: "${orgId}"`)
    const { count: totalMachines, error: machineCountError } = await supabase
      .from('press_machines')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)

    console.log('📊 Total machines for org:', totalMachines, 'Error:', machineCountError)

    // 実際のorg_idを確認
    const { data: machineOrgIds, error: orgIdsError } = await supabase
      .from('press_machines')
      .select('org_id')
      .limit(10)

    console.log('📋 Sample org_ids in press_machines:', machineOrgIds?.map(m => m.org_id))

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