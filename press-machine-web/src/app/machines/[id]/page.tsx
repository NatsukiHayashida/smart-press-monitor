'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider-minimal'
import { getEffectiveOrgId } from '@/lib/org'
import { PressMachine, MaintenanceRecordWithMachine } from '@/types/database'
import { MachineDetail } from '@/components/machines/MachineDetail'
import { Header } from '@/components/layout/Header'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function MachineDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = supabaseBrowser()
  const { user, profile, loading } = useAuth()
  const [machine, setMachine] = useState<PressMachine | null>(null)
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecordWithMachine[]>([])
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
  }, [loading, user, orgId, machineId])

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
            <h2 className="text-lg font-semibold text-red-800 mb-2">データ読み込みエラー</h2>
            <p className="text-red-700">{error}</p>
            <div className="mt-4">
              <p className="text-sm text-red-600">デバッグ情報:</p>
              <ul className="text-xs text-red-600 mt-1 space-y-1">
                <li>• ユーザー: {user?.email}</li>
                <li>• プロフィール組織ID: {profile?.org_id || '未設定'}</li>
                <li>• 有効組織ID: {orgId || '取得失敗'}</li>
                <li>• 機械ID: {machineId}</li>
              </ul>
            </div>
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
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                編集
              </Button>
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

          {/* サイドバー - メンテナンス記録 */}
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
                            variant={record.overall_judgment === 'A:良好' ? 'default' : 
                                   record.overall_judgment === 'B:一部修理' ? 'outline' : 'destructive'}
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