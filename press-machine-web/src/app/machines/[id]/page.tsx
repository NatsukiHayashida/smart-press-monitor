'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabaseBrowser } from '@/lib/supabase/client'
import { PressMachine, MaintenanceRecordWithMachine } from '@/types/database'
import { MachineForm } from '@/components/machines/MachineForm'
import { Header } from '@/components/layout/Header'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

export default function MachineDetailPage() {
  const { user, profile, loading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const [machine, setMachine] = useState<PressMachine | null>(null)
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecordWithMachine[]>([])
  const [loadingMachine, setLoadingMachine] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const supabase = supabaseBrowser()

  const machineId = parseInt(params.id as string)

  useEffect(() => {
    if (!user || !profile?.org_id || !machineId) return

    loadMachine()
    loadMaintenanceRecords()
  }, [user, profile?.org_id, machineId])

  const loadMachine = async () => {
    setLoadingMachine(true)
    const { data, error } = await supabase
      .from('press_machines')
      .select('*')
      .eq('id', machineId)
      .eq('org_id', profile!.org_id)
      .single()

    if (error) {
      console.error('Error loading machine:', error)
      router.push('/machines')
    } else {
      setMachine(data)
    }
    setLoadingMachine(false)
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
      .eq('press_id', machineId)
      .eq('org_id', profile!.org_id)
      .order('maintenance_datetime', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error loading maintenance records:', error)
    } else {
      setMaintenanceRecords(data || [])
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

  if (loading || loadingMachine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
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

  if (!profile?.org_id) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800">
              組織への参加が必要です。管理者にお問い合わせください。
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!machine) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">プレス機が見つかりません</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/machines">
                <Button variant="outline">← 戻る</Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                プレス機詳細: {machine.machine_number}
              </h1>
            </div>
            <div className="flex gap-2">
              {!isEditing && (
                <>
                  <Button onClick={() => setIsEditing(true)}>編集</Button>
                  <Button variant="destructive" onClick={handleDelete}>削除</Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEditing ? 'プレス機編集' : 'プレス機情報'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <MachineForm 
                    machine={machine}
                    onSuccess={handleUpdateSuccess}
                    onCancel={() => setIsEditing(false)}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">機械番号</label>
                        <p className="text-lg font-semibold">{machine.machine_number}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">設備番号</label>
                        <p>{machine.equipment_number || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">メーカー</label>
                        <p>{machine.manufacturer || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">型式</label>
                        <p>{machine.model_type || '-'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">シリアル番号</label>
                      <p>{machine.serial_number || '-'}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">種別</label>
                        <div>
                          <Badge variant={machine.machine_type === '圧造' ? 'default' : 'secondary'}>
                            {machine.machine_type}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">グループ</label>
                        <p>グループ{machine.production_group}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">トン数</label>
                        <p>{machine.tonnage ? `${machine.tonnage}t` : '-'}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div>
                        <label className="font-medium">登録日</label>
                        <p>{new Date(machine.created_at).toLocaleString('ja-JP')}</p>
                      </div>
                      <div>
                        <label className="font-medium">更新日</label>
                        <p>{new Date(machine.updated_at).toLocaleString('ja-JP')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>最近のメンテナンス記録</CardTitle>
                  <Link href="/maintenance">
                    <Button variant="outline" size="sm">全て見る</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {maintenanceRecords.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    メンテナンス記録がありません
                  </p>
                ) : (
                  <div className="space-y-3">
                    {maintenanceRecords.map((record) => (
                      <div key={record.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {new Date(record.maintenance_datetime).toLocaleDateString('ja-JP')}
                          </span>
                          <Badge 
                            variant={record.overall_judgment === '良好' ? 'default' : 'destructive'}
                          >
                            {record.overall_judgment}
                          </Badge>
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
          </div>
        </div>
      </main>
    </div>
  )
}