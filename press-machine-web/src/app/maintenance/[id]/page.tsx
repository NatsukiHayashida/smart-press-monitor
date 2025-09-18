'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { getEffectiveOrgId } from '@/lib/org'
import { MaintenanceRecord, PressMachine } from '@/types/database'
import { Header } from '@/components/layout/Header'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Calendar, FileText, Wrench, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function MaintenanceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const { user, profile, loading } = useAuth()
  const [record, setRecord] = useState<MaintenanceRecord | null>(null)
  const [machine, setMachine] = useState<PressMachine | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const orgId = getEffectiveOrgId(profile)
  const recordId = params.id as string

  useEffect(() => {
    if (loading) return
    if (!user) { setError('ログインが必要です'); setIsLoading(false); return }
    if (!orgId) { setError('組織が未設定です（org_id が見つかりません）'); setIsLoading(false); return }
    if (!recordId || isNaN(Number(recordId))) { setError('無効なメンテナンス記録IDです'); setIsLoading(false); return }

    loadMaintenanceRecord()
  }, [loading, user, orgId, recordId])

  const loadMaintenanceRecord = async () => {
    let mounted = true
    console.log('Loading maintenance record for ID:', recordId, 'org:', orgId)
    
    try {
      // メンテナンス記録を取得
      const { data: recordData, error: recordError } = await supabase
        .from('maintenance_records')
        .select('*')
        .eq('id', Number(recordId))
        .eq('org_id', orgId!)
        .single()

      if (!mounted) return
      if (recordError) {
        console.error('Maintenance record query error:', recordError)
        setError(recordError.message)
        setIsLoading(false)
        return
      }

      console.log('Maintenance record loaded:', recordData)
      setRecord(recordData)

      // 関連するプレス機情報を取得
      if (recordData.press_id) {
        const { data: machineData, error: machineError } = await supabase
          .from('press_machines')
          .select('*')
          .eq('id', recordData.press_id)
          .eq('org_id', orgId!)
          .single()

        if (machineError) {
          console.error('Machine query error:', machineError)
        } else {
          setMachine(machineData)
        }
      }

      setIsLoading(false)
    } catch (error: any) {
      console.error('Error loading maintenance record:', error)
      setError(error.message)
      setIsLoading(false)
    }
  }

  const getJudgmentBadgeVariant = (judgment: string) => {
    switch (judgment) {
      case 'A:良好':
        return 'default'
      case 'B:一部修理':
        return 'outline'
      case 'C:大幅修理':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case '実施':
        return '実施済み'
      case '未実施':
        return '未実施'
      case '不要':
        return '不要'
      default:
        return status
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case '実施':
        return 'default'
      case '未実施':
        return 'outline'
      case '不要':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">メンテナンス記録を読み込んでいます...</p>
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
          <div className="mb-6">
            <Link href="/maintenance">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                メンテナンス記録一覧に戻る
              </Button>
            </Link>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-red-800">データ読み込みエラー</h2>
            </div>
            <p className="text-red-700 mt-2">メンテナンス記録の読み込み中にエラーが発生しました。ページを更新してもう一度お試しください。</p>
          </div>
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="mb-6">
            <Link href="/maintenance">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                メンテナンス記録一覧に戻る
              </Button>
            </Link>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">記録が見つかりません</h2>
            <p className="text-yellow-700">指定されたメンテナンス記録ID ({recordId}) は存在しないか、アクセス権限がありません。</p>
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
            <div className="flex items-center space-x-4">
              <Link href="/maintenance">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Wrench className="w-8 h-8 mr-3 text-primary" />
                  メンテナンス記録詳細
                </h1>
                <p className="text-gray-600">
                  記録ID: {record.id} | 実施日: {new Date(record.maintenance_date).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/maintenance/${recordId}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  編集
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メイン情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  基本情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">実施日</label>
                    <p className="text-lg font-semibold">
                      {new Date(record.maintenance_date).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">全体判定</label>
                    <div className="mt-1">
                      <Badge variant={getJudgmentBadgeVariant(record.overall_judgment)}>
                        {record.overall_judgment}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">担当者</label>
                    <p className="text-lg">{record.technician || '未記録'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">作業時間</label>
                    <p className="text-lg">{record.work_duration ? `${record.work_duration}分` : '未記録'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 電磁弁交換 */}
            <Card>
              <CardHeader>
                <CardTitle>電磁弁交換</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">クラッチバルブ交換</label>
                    <div className="mt-1">
                      <Badge variant={getStatusBadgeVariant(record.clutch_valve_replacement)}>
                        {getStatusText(record.clutch_valve_replacement)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">ブレーキバルブ交換</label>
                    <div className="mt-1">
                      <Badge variant={getStatusBadgeVariant(record.brake_valve_replacement)}>
                        {getStatusText(record.brake_valve_replacement)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 点検項目 */}
            <Card>
              <CardHeader>
                <CardTitle>点検項目</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">スライド調整ボルト</label>
                      <div className="mt-1">
                        <Badge variant={getStatusBadgeVariant(record.slide_adjustment_bolt)}>
                          {getStatusText(record.slide_adjustment_bolt)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">ダイハイト調整</label>
                      <div className="mt-1">
                        <Badge variant={getStatusBadgeVariant(record.die_height_adjustment)}>
                          {getStatusText(record.die_height_adjustment)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">エアタンク排水</label>
                      <div className="mt-1">
                        <Badge variant={getStatusBadgeVariant(record.air_tank_drain)}>
                          {getStatusText(record.air_tank_drain)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">金型台掃除</label>
                      <div className="mt-1">
                        <Badge variant={getStatusBadgeVariant(record.die_base_cleaning)}>
                          {getStatusText(record.die_base_cleaning)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">チャック</label>
                      <div className="mt-1">
                        <Badge variant={getStatusBadgeVariant(record.chuck_inspection)}>
                          {getStatusText(record.chuck_inspection)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 備考 */}
            {record.remarks && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-gray-600" />
                    備考
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{record.remarks}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-4">
            {/* 関連プレス機 */}
            {machine && (
              <Card>
                <CardHeader>
                  <CardTitle>関連プレス機</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">機械番号</label>
                      <p className="text-lg font-mono">{machine.machine_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">メーカー</label>
                      <p>{machine.manufacturer || machine.maker || '未記録'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">型式</label>
                      <p>{machine.model_type || machine.model || '未記録'}</p>
                    </div>
                    <div className="pt-3">
                      <Link href={`/machines/${machine.id}`}>
                        <Button variant="outline" className="w-full">
                          プレス機詳細を見る
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* アクション */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-2">
                  <Link href={`/maintenance/${recordId}/edit`}>
                    <Button variant="outline" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      この記録を編集
                    </Button>
                  </Link>
                  {machine && (
                    <Link href={`/maintenance/new?machineId=${machine.id}`}>
                      <Button variant="outline" className="w-full">
                        <Wrench className="w-4 h-4 mr-2" />
                        新規メンテナンス記録
                      </Button>
                    </Link>
                  )}
                  <Link href="/maintenance">
                    <Button variant="outline" className="w-full">
                      メンテナンス記録一覧
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}