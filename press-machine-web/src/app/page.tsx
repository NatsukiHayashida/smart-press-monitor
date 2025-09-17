'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { Header } from '@/components/layout/Header'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  BarChart3, 
  Settings, 
  TrendingUp, 
  Wrench,
  AlertCircle,
  ArrowRight,
  Database
} from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  totalMachines: number
  machinesByType: { [key: string]: number }
  machinesByGroup: { [key: string]: number }
  totalMaintenance: number
  recentMaintenance: {
    id: number
    machine_number: string
    maintenance_date: string
    overall_judgment: string
  }[]
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboardData = async () => {
    console.log('🔄 Loading dashboard data via API...')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch dashboard data')
      }

      const data = await response.json()
      console.log('✅ Dashboard data received:', data)
      setDashboardData(data)

    } catch (error: any) {
      console.error('❌ Dashboard data loading error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (loading) return
    if (!user) return

    loadDashboardData()
  }, [loading, user])

  // 認証チェック - loadingがfalseでuserがない場合はClerkサインインページへリダイレクト
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth/sign-in'
    }
  }, [loading, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">認証状態を確認しています...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center py-8">
            <p className="text-gray-600">ログインページへリダイレクトしています...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">ダッシュボードを読み込んでいます...</p>
          </div>
        </div>
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
                <Database className="w-8 h-8 mr-3 text-blue-600" />
                ダッシュボード
              </h1>
              <p className="text-gray-600">プレス機管理システムの概要</p>
            </div>
            <Button onClick={loadDashboardData} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              データ更新
            </Button>
          </div>
        </div>

        {dashboardData && (
          <div className="space-y-6">
            {/* 基本統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    総プレス機台数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {dashboardData.totalMachines}台
                  </div>
                  <Link href="/machines">
                    <Button variant="outline" size="sm" className="mt-3">
                      一覧を見る <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Wrench className="w-4 h-4 mr-2" />
                    総メンテナンス記録
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {dashboardData.totalMaintenance}件
                  </div>
                  <Link href="/maintenance">
                    <Button variant="outline" size="sm" className="mt-3">
                      一覧を見る <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* 種別・グループ集計 */}
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
                    {Object.entries(dashboardData.machinesByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-gray-700">{type}</span>
                        <Badge variant="outline" className="font-semibold">
                          {count}台
                        </Badge>
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
                    {Object.entries(dashboardData.machinesByGroup)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([group, count]) => (
                      <div key={group} className="flex justify-between items-center">
                        <span className="text-gray-700">{group}</span>
                        <Badge variant="outline" className="font-semibold">
                          {count}台
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 最近のメンテナンス記録 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Wrench className="w-5 h-5 mr-2 text-orange-600" />
                    最近のメンテナンス記録
                  </CardTitle>
                  <Link href="/analytics">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      詳細な統計を見る
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {dashboardData.recentMaintenance.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    メンテナンス記録がありません
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboardData.recentMaintenance.map((record) => (
                      <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-sm font-medium">
                            #{record.machine_number}
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(record.maintenance_date).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                        <Badge 
                          variant={record.overall_judgment === 'A:良好' ? 'default' : 
                                 record.overall_judgment === 'B:一部修理' ? 'outline' : 'destructive'}
                        >
                          {record.overall_judgment}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}