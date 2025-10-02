'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Header } from '@/components/layout/Header'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart'
import { RefreshCw, BarChart3, Settings, TrendingUp, AlertCircle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

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
  const { user, loading } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalyticsData = async () => {
    console.log('🔄 Loading analytics data via API...')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/analytics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch analytics data')
      }

      const data = await response.json()
      console.log('✅ Analytics data received:', data)
      setAnalyticsData(data)

    } catch (error: any) {
      console.error('❌ Analytics data loading error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (loading) return
    if (!user) return

    loadAnalyticsData()
  }, [loading, user])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
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
                <BarChart3 className="w-8 h-8 mr-3 text-primary" />
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
                  <div className="text-2xl font-bold text-primary">
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
                    <Settings className="w-5 h-5 mr-2 text-primary" />
                    種別別集計
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    {/* Pie Chart */}
                    <div className="w-full md:col-span-3">
                      <ChartContainer
                        config={{
                          count: {
                            label: "台数",
                          },
                          ...Object.keys(analyticsData.machinesByType).reduce((acc, type) => {
                            const typeColors: {[key: string]: string} = {
                              '圧造': '#3b82f6',  // blue-500
                              '汎用': '#64748b',  // slate-500
                              'その他': '#f97316' // orange-500
                            }
                            return {
                              ...acc,
                              [type]: {
                                label: type,
                                color: typeColors[type] || typeColors['その他'],
                              }
                            }
                          }, {})
                        }}
                        className="mx-auto aspect-square max-h-[200px]"
                      >
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent
                              hideLabel
                              formatter={(value, name) => [`${value}台`, name]}
                            />}
                          />
                          <Pie
                            data={Object.entries(analyticsData.machinesByType).map(([type, count]) => ({
                              name: type,
                              value: count,
                              fill: `var(--color-${type})`
                            }))}
                            dataKey="value"
                            nameKey="name"
                            startAngle={90}
                            endAngle={450}
                          />
                        </PieChart>
                      </ChartContainer>
                    </div>

                    {/* Stats List */}
                    <div className="space-y-3 flex flex-col justify-center md:col-span-2 md:pr-6">
                      {Object.entries(analyticsData.machinesByType).map(([type, count]) => {
                        const machineTypeColors: {[key: string]: string} = {
                          '圧造': 'bg-blue-100 text-blue-800 border-blue-200',
                          '汎用': 'bg-slate-100 text-slate-800 border-slate-200',
                          'その他': 'bg-orange-100 text-orange-800 border-orange-200'
                        }
                        return (
                          <div key={type} className="flex items-center justify-between">
                            <Badge variant="outline" className={`${machineTypeColors[type] || machineTypeColors['その他']}`}>{type}</Badge>
                            <span className="font-semibold text-primary tabular-nums">{count}台</span>
                          </div>
                        )
                      })}
                    </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    {/* Pie Chart */}
                    <div className="w-full md:col-span-3">
                      <ChartContainer
                        config={{
                          count: {
                            label: "台数",
                          },
                          ...Object.keys(analyticsData.machinesByGroup).reduce((acc, group) => {
                            const groupChartColors: {[key: string]: string} = {
                              '生産1': '#10b981',  // emerald-500
                              '生産2': '#06b6d4',  // cyan-500
                              '生産3': '#a855f7',  // purple-500
                              '東大阪': '#eab308', // yellow-500
                              '本社': '#ef4444',   // red-500
                              '試作': '#6366f1',   // indigo-500
                              'その他': '#f43f5e'  // rose-500
                            }
                            return {
                              ...acc,
                              [group]: {
                                label: group,
                                color: groupChartColors[group] || groupChartColors['その他'],
                              }
                            }
                          }, {})
                        }}
                        className="mx-auto aspect-square max-h-[200px]"
                      >
                        <PieChart>
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent
                              hideLabel
                              formatter={(value, name) => [`${value}台`, name]}
                            />}
                          />
                          <Pie
                            data={Object.entries(analyticsData.machinesByGroup).map(([group, count]) => ({
                              name: group,
                              value: count,
                              fill: `var(--color-${group})`
                            }))}
                            dataKey="value"
                            nameKey="name"
                            startAngle={90}
                            endAngle={450}
                          />
                        </PieChart>
                      </ChartContainer>
                    </div>

                    {/* Stats List */}
                    <div className="space-y-3 flex flex-col justify-center md:col-span-2 md:pr-6">
                      {Object.entries(analyticsData.machinesByGroup)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([group, count], index) => {
                        const groupColors: {[key: string]: string} = {
                          '生産1': 'bg-emerald-100 text-emerald-800 border-emerald-200',
                          '生産2': 'bg-cyan-100 text-cyan-800 border-cyan-200',
                          '生産3': 'bg-purple-100 text-purple-800 border-purple-200',
                          '東大阪': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                          '本社': 'bg-red-100 text-red-800 border-red-200',
                          '試作': 'bg-indigo-100 text-indigo-800 border-indigo-200',
                          'その他': 'bg-rose-100 text-rose-800 border-rose-200'
                        }
                        return (
                          <div key={group} className="flex items-center justify-between">
                            <Badge variant="outline" className={`${groupColors[group] || groupColors['その他']}`}>{group}</Badge>
                            <span className="font-semibold text-green-600 tabular-nums">{count}台</span>
                          </div>
                        )
                      })}
                    </div>
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