'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { getEffectiveOrgId } from '@/lib/org'
import { PressMachine, MaintenanceRecordWithMachine, MaintenanceScheduleWithMachine } from '@/types/database'
import { MachineDetail } from '@/components/machines/MachineDetail'
import { Header } from '@/components/layout/Header'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2, AlertCircle, Plus, Wrench, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'

export default function MachineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = supabaseBrowser()
  const { user, profile, loading } = useAuth()
  const [machine, setMachine] = useState<PressMachine | null>(null)
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecordWithMachine[]>([])
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceScheduleWithMachine[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  const orgId = getEffectiveOrgId(profile)
  const machineId = params.id as string

  useEffect(() => {
    if (loading) return
    if (!user) { setError('ログインが必要です'); setIsLoading(false); return }
    if (!orgId) { setError('組織が未設定です（org_id が見つかりません）'); setIsLoading(false); return }
    if (!machineId || isNaN(Number(machineId))) { setError('無効な機械IDです'); setIsLoading(false); return }

    loadMachine()
    loadMaintenanceRecords()
    loadMaintenanceSchedules()
  }, [loading, user, orgId, machineId])

  // Realtime subscription for maintenance records
  useEffect(() => {
    if (!orgId || !machineId) return
    
    console.log('Setting up maintenance realtime subscription for machine:', machineId)
    const ch = supabase.channel(`maintenance_records-machine-${machineId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'maintenance_records', 
        filter: `press_id=eq.${machineId}` 
      }, (payload) => {
        console.log('Maintenance realtime update received for machine:', payload)
        loadMaintenanceRecords()
      })
      .subscribe()
    
    return () => { 
      console.log('Cleaning up maintenance realtime subscription for machine')
      supabase.removeChannel(ch) 
    }
  }, [orgId, machineId, supabase])

  // Realtime subscription for maintenance schedules
  useEffect(() => {
    if (!orgId || !machineId) return
    
    console.log('Setting up schedule realtime subscription for machine:', machineId)
    
    try {
      const ch = supabase.channel(`maintenance_schedules-machine-${machineId}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'maintenance_schedules', 
          filter: `press_id=eq.${machineId}` 
        }, (payload) => {
          console.log('Schedule realtime update received for machine:', payload)
          loadMaintenanceSchedules()
        })
        .subscribe()
      
      return () => { 
        console.log('Cleaning up schedule realtime subscription for machine')
        supabase.removeChannel(ch) 
      }
    } catch (error) {
      console.log('Could not set up realtime subscription for schedules (table may not exist):', error)
    }
  }, [orgId, machineId, supabase])

  const loadMachine = async () => {
    let mounted = true
    console.log('Loading machine details for ID:', machineId, 'org:', orgId)
    const { data, error } = await supabase
      .from('press_machines')
      .select('*')
      .eq('id', Number(machineId))
      .eq('org_id', orgId!)
      .single()

    if (!mounted) return
    if (error) {
      console.error('Machine query error:', error)
      setError(error.message)
      setIsLoading(false)
      return
    }
    console.log('Machine loaded:', data)
    setMachine(data)
    setIsLoading(false)
  }

  const loadMaintenanceRecords = async () => {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select(`
        *,
        press_machines (
          machine_number,
          manufacturer,
          model_type
        )
      `)
      .eq('press_id', Number(machineId))
      .eq('org_id', orgId!)
      .order('maintenance_date', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error loading maintenance records:', error)
    } else {
      setMaintenanceRecords(data || [])
    }
  }

  const loadMaintenanceSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select(`
          *,
          press_machines (
            machine_number,
            manufacturer,
            model_type
          )
        `)
        .eq('press_id', Number(machineId))
        .eq('org_id', orgId!)
        .in('status', ['scheduled', 'in_progress'])
        .order('scheduled_date', { ascending: true })
        .limit(5)

      if (error) {
        console.error('Error loading maintenance schedules:', error)
        // テーブルが存在しない場合は空配列を設定
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.log('maintenance_schedules table does not exist yet')
          setMaintenanceSchedules([])
          return
        }
      } else {
        setMaintenanceSchedules(data || [])
      }
    } catch (err) {
      console.error('Unexpected error loading maintenance schedules:', err)
      setMaintenanceSchedules([])
    }
  }

  const handleUpdateSuccess = () => {
    setIsEditing(false)
    loadMachine()
  }

  const handleDelete = async () => {
    if (!machine || !confirm('このプレス機を削除しますか？この操作は取り消せません。')) return

    const { error } = await supabase
      .from('press_machines')
      .delete()
      .eq('id', machine.id)

    if (error) {
      console.error('Error deleting machine:', error)
      alert('削除中にエラーが発生しました')
    } else {
      router.push('/machines')
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">機械情報を読み込んでいます...</p>
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
            <Link href="/machines">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                プレス機一覧に戻る
              </Button>
            </Link>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-red-800">データ読み込みエラー</h2>
            </div>
            <p className="text-red-700 mt-2">プレス機情報の読み込み中にエラーが発生しました。ページを更新してもう一度お試しください。</p>
          </div>
        </div>
      </div>
    )
  }

  if (!machine) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="mb-6">
            <Link href="/machines">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                プレス機一覧に戻る
              </Button>
            </Link>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">機械が見つかりません</h2>
            <p className="text-yellow-700">指定された機械ID ({machineId}) は存在しないか、アクセス権限がありません。</p>
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
              <Link href="/machines">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  プレス機 #{machine.machine_number}
                </h1>
                <p className="text-gray-600">
                  {machine.maker || machine.manufacturer} {machine.model || machine.model_type}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/machines/${machineId}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  編集
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                削除
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 詳細情報 - メインコンテンツ */}
          <div className="lg:col-span-2">
            <MachineDetail machine={machine} />
          </div>

          {/* サイドバー - メンテナンス関連 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>最近のメンテナンス記録</CardTitle>
              </CardHeader>
              <CardContent>
                {maintenanceRecords.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">
                      メンテナンス記録がありません
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {maintenanceRecords.map((record) => (
                      <div key={record.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {new Date(record.maintenance_date).toLocaleDateString('ja-JP')}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={record.overall_judgment === 'A:良好' ? 'default' : 
                                     record.overall_judgment === 'B:一部修理' ? 'outline' : 'destructive'}
                            >
                              {record.overall_judgment}
                            </Badge>
                            <Link href={`/maintenance/${record.id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Wrench className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>クラッチバルブ: {record.clutch_valve_replacement}</p>
                          <p>ブレーキバルブ: {record.brake_valve_replacement}</p>
                          {record.remarks && <p>備考: {record.remarks}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* メンテナンス予定 */}
            <Card>
              <CardHeader>
                <CardTitle>メンテナンス予定</CardTitle>
              </CardHeader>
              <CardContent>
                {maintenanceSchedules.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">
                      予定されたメンテナンスがありません
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      「新規メンテナンス予定」ボタンから予定を作成できます
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {maintenanceSchedules.map((schedule) => {
                      const isUpcoming = () => {
                        const today = new Date()
                        const scheduleDate = new Date(schedule.scheduled_date)
                        const diffTime = scheduleDate.getTime() - today.getTime()
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        return diffDays <= 7 && diffDays >= 0
                      }

                      const isOverdue = () => {
                        if (schedule.status === 'completed' || schedule.status === 'cancelled') return false
                        const today = new Date()
                        const scheduleDate = new Date(schedule.scheduled_date)
                        return scheduleDate < today
                      }

                      const getMaintenanceTypeLabel = (type: string) => {
                        const types: Record<string, string> = {
                          'routine': '定期メンテナンス',
                          'inspection': '定期点検',
                          'repair': '修理',
                          'overhaul': 'オーバーホール',
                          'emergency': '緊急対応',
                          'preventive': '予防保全'
                        }
                        return types[type] || type
                      }

                      const getPriorityColor = (priority: string) => {
                        switch (priority) {
                          case 'high': return 'bg-red-100 text-red-800'
                          case 'normal': return 'bg-blue-100 text-blue-800'
                          case 'low': return 'bg-gray-100 text-gray-800'
                          default: return 'bg-gray-100 text-gray-800'
                        }
                      }

                      const getPriorityLabel = (priority: string) => {
                        const priorities: Record<string, string> = {
                          'high': '高', 'normal': '中', 'low': '低'
                        }
                        return priorities[priority] || priority
                      }

                      return (
                        <div 
                          key={schedule.id} 
                          className={`border rounded p-3 ${
                            isOverdue() ? 'bg-red-50 border-red-200' :
                            isUpcoming() ? 'bg-yellow-50 border-yellow-200' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium">
                                {new Date(schedule.scheduled_date).toLocaleDateString('ja-JP')}
                              </span>
                              {isOverdue() && (
                                <Badge variant="destructive" className="text-xs">期限切れ</Badge>
                              )}
                              {isUpcoming() && (
                                <Badge variant="outline" className="text-xs">間もなく</Badge>
                              )}
                            </div>
                            <Link href={`/maintenance/schedules/${schedule.id}/edit`}>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Wrench className="w-3 h-3" />
                              </Button>
                            </Link>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex items-center justify-between">
                              <p>{getMaintenanceTypeLabel(schedule.maintenance_type)}</p>
                              <Badge className={`text-xs ${getPriorityColor(schedule.priority)}`}>
                                {getPriorityLabel(schedule.priority)}
                              </Badge>
                            </div>
                            {schedule.estimated_duration && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <p>{schedule.estimated_duration}分</p>
                              </div>
                            )}
                            {schedule.assigned_technician && (
                              <p>担当: {schedule.assigned_technician}</p>
                            )}
                            {schedule.planned_work && (
                              <p className="truncate" title={schedule.planned_work}>
                                {schedule.planned_work}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* メンテナンス関連のアクションボタン */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-2">
                  <Link href={`/maintenance/schedules/new?machineId=${machineId}`}>
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      新規メンテナンス予定
                    </Button>
                  </Link>
                  <Link href={`/maintenance/new?machineId=${machineId}`}>
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      新規メンテナンス記録
                    </Button>
                  </Link>
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