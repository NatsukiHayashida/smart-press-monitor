'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabaseBrowser } from '@/lib/supabase/client'
import { getEffectiveOrgId } from '@/lib/org'
import { Header } from '@/components/layout/Header'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, BarChart3, Settings, TrendingUp, AlertCircle } from 'lucide-react'
import { getProductionGroupName } from '@/lib/productionGroups'

interface AnalyticsData {
  totalMachines: number
  machinesByType: { [key: string]: number }
  machinesByGroup: { [key: string]: number }
  totalMaintenance: number
  latestMaintenanceByMachine: { machine_number: string; latest_maintenance: string | null }[]
  valveReplacements: {
    clutch: number
    brake: number
  }
}

export default function AnalyticsPage() {
  const { user, profile, loading } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = supabaseBrowser()
  const orgId = getEffectiveOrgId(profile)

  const loadAnalyticsData = async () => {
    if (!orgId) return

    setIsLoading(true)
    setError(null)

    try {
      // 総台数取得
      const { count: totalMachines, error: machineCountError } = await supabase
        .from('press_machines')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)

      if (machineCountError) throw machineCountError

      // 種別別集計
      const { data: machineTypeData, error: typeError } = await supabase
        .from('press_machines')
        .select('machine_type')
        .eq('org_id', orgId)

      if (typeError) throw typeError

      const machinesByType = (machineTypeData as any[])?.reduce((acc: { [key: string]: number }, machine: any) => {
        acc[machine.machine_type] = (acc[machine.machine_type] || 0) + 1
        return acc
      }, {}) || {}

      // グループ別集計
      const { data: machineGroupData, error: groupError } = await supabase
        .from('press_machines')
        .select('production_group')
        .eq('org_id', orgId)

      if (groupError) throw groupError

      const machinesByGroup = (machineGroupData as any[])?.reduce((acc: { [key: string]: number }, machine: any) => {
        const group = getProductionGroupName(machine.production_group)
        acc[group] = (acc[group] || 0) + 1
        return acc
      }, {}) || {}

      // 総メンテナンス記録数
      const { count: totalMaintenance, error: maintenanceCountError } = await supabase
        .from('maintenance_records')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)

      if (maintenanceCountError) throw maintenanceCountError

      // 各機械の最新メンテナンス日を集計
      // まず、機械IDと番号の対応を取得
      const { data: machineData, error: machineDataError } = await supabase
        .from('press_machines')
        .select('id, machine_number')
        .eq('org_id', orgId)
      if (machineDataError) throw machineDataError

      const latestMaintenanceByMachine = []
      for (const machine of (machineData as any[]) || []) {
        const { data: maintenanceData, error: maintenanceError } = await supabase
          .from('maintenance_records')
          .select('maintenance_date')
          .eq('org_id', orgId)
          .eq('press_id', machine.id)  // machine_numberではなくpress_idを使用
          .order('maintenance_date', { ascending: false })
          .limit(1)

        if (maintenanceError) {
          console.warn(`Error fetching maintenance for machine ${machine.machine_number} (ID: ${machine.id}):`, maintenanceError)
        }

        latestMaintenanceByMachine.push({
          machine_number: machine.machine_number,
          latest_maintenance: (maintenanceData as any)?.[0]?.maintenance_date || null
        })
        console.log(`Machine ${machine.machine_number} (ID: ${machine.id}): Latest maintenance = ${(maintenanceData as any)?.[0]?.maintenance_date || 'None'}`)
      }

      // 電磁弁交換統計
      const { data: clutchData, error: clutchError } = await supabase
        .from('maintenance_records')
        .select('clutch_valve_replacement')
        .eq('org_id', orgId)
        .eq('clutch_valve_replacement', '実施')

      if (clutchError) throw clutchError

      const { data: brakeData, error: brakeError } = await supabase
        .from('maintenance_records')
        .select('brake_valve_replacement')
        .eq('org_id', orgId)
        .eq('brake_valve_replacement', '実施')

      if (brakeError) throw brakeError

      setAnalyticsData({
        totalMachines: totalMachines || 0,
        machinesByType,
        machinesByGroup,
        totalMaintenance: totalMaintenance || 0,
        latestMaintenanceByMachine,
        valveReplacements: {
          clutch: clutchData?.length || 0,
          brake: brakeData?.length || 0
        }
      })

    } catch (error: any) {
      console.error('Analytics data loading error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (loading) return
    if (!user || !orgId) return
    
    loadAnalyticsData()
  }, [loading, user, orgId])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">分析データを読み込んでいます...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoginForm />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-red-800">データ読み込みエラー</h2>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* ヘッダーセクション */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
                統計・レポート
              </h1>
              <p className="text-gray-600">詳細な統計情報とレポート</p>
            </div>
            <Button onClick={loadAnalyticsData} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              統計データ更新
            </Button>
          </div>
        </div>

        {analyticsData && (
          <div className="space-y-6">
            {/* 基本統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">総プレス機台数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData.totalMachines}台
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">総メンテナンス記録</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.totalMaintenance}件
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">クラッチ弁交換</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {analyticsData.valveReplacements.clutch}件
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">ブレーキ弁交換</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {analyticsData.valveReplacements.brake}件
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 詳細統計 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 種別別集計 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-blue-600" />
                    種別別集計
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.machinesByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-gray-700">{type}</span>
                        <span className="font-semibold text-blue-600">{count}台</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 生産グループ別集計 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    生産グループ別集計
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.machinesByGroup)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([group, count]) => (
                      <div key={group} className="flex justify-between items-center">
                        <span className="text-gray-700">{group}</span>
                        <span className="font-semibold text-green-600">{count}台</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 最新メンテナンス実施状況 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                  最新メンテナンス実施状況
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-medium text-gray-700">機械番号</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-700">最新メンテナンス実施日</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.latestMaintenanceByMachine.map((item, index) => (
                        <tr key={`${item.machine_number}-${index}`} className="border-b border-gray-100">
                          <td className="py-2 px-4 font-mono text-sm">{item.machine_number}</td>
                          <td className="py-2 px-4 text-sm">
                            {item.latest_maintenance 
                              ? new Date(item.latest_maintenance).toLocaleDateString('ja-JP') 
                              : <span className="text-red-500">未実施</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}