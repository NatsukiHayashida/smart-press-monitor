'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { getEffectiveOrgId } from '@/lib/org'
import { Header } from '@/components/layout/Header'
import { MaintenanceForm } from '@/components/maintenance/MaintenanceForm'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { updateMaintenanceRecord } from '@/app/maintenance/actions'
import { toast } from 'sonner'

interface MaintenanceRecord {
  id: number
  press_id: number
  maintenance_date: string
  overall_judgment: string
  clutch_valve_replacement: string
  brake_valve_replacement: string
  remarks: string
  org_id: string
  created_at: string
  updated_at: string
}

interface Machine {
  id: number
  machine_number: string
  machine_name: string
  machine_type: string
  manufacturer: string
  production_group: number
}

export default function EditMaintenancePage({ params }: { params: Promise<{ id: string }> }) {
  const { user, profile, loading: authLoading } = useAuth()
  const [record, setRecord] = useState<MaintenanceRecord | null>(null)
  const [machine, setMachine] = useState<Machine | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recordId, setRecordId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const orgId = getEffectiveOrgId(profile)

  // paramsを非同期で取得
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setRecordId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (!authLoading && user && orgId && recordId) {
      loadMaintenanceRecord()
    }
  }, [authLoading, user, orgId, recordId])

  const loadMaintenanceRecord = async () => {
    if (!orgId || !recordId) return

    // IDの妥当性チェック
    const parsedRecordId = parseInt(recordId, 10)
    if (isNaN(parsedRecordId)) {
      setError('無効なメンテナンス記録IDです')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Loading maintenance record with ID:', parsedRecordId, 'orgId:', orgId)
      
      // メンテナンス記録を取得
      const { data: recordData, error: recordError } = await supabase
        .from('maintenance_records')
        .select('*')
        .eq('id', parsedRecordId)
        .eq('org_id', orgId)
        .single()

      console.log('Maintenance record query result:', { recordData, recordError })

      if (recordError) {
        console.error('Record error details:', recordError)
        throw new Error(`メンテナンス記録の取得エラー: ${recordError.message}`)
      }
      
      if (!recordData) {
        throw new Error('メンテナンス記録が見つかりません')
      }

      setRecord(recordData)

      // 関連するプレス機情報を取得
      const machineIdField = recordData.press_id
      console.log('Looking for machine with ID:', machineIdField)
      
      const { data: machineData, error: machineError } = await supabase
        .from('press_machines')
        .select('*')
        .eq('id', machineIdField)
        .eq('org_id', orgId)
        .single()

      console.log('Machine query result:', { machineData, machineError })

      if (machineError) {
        console.error('Machine error details:', machineError)
        throw new Error(`プレス機情報の取得エラー: ${machineError.message}`)
      }
      
      setMachine(machineData)

    } catch (error: any) {
      console.error('Loading error:', error)
      setError(error.message || 'データの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (data: any) => {
    if (!record) return

    try {
      const recordData = {
        maintenanceDate: data.maintenance_date,
        overallJudgment: data.overall_judgment,
        clutchValveReplacement: data.clutch_valve_replacement,
        brakeValveReplacement: data.brake_valve_replacement,
        remarks: data.remarks || null,
      }

      const result = await updateMaintenanceRecord(record.id, recordData)

      if (result.success) {
        toast.success('メンテナンス記録を更新しました')
        router.push('/maintenance')
      } else {
        toast.error(result.error || 'メンテナンス記録の更新に失敗しました')
        throw new Error(result.error || 'メンテナンス記録の更新に失敗しました')
      }
    } catch (error: any) {
      console.error('Update error full details:', error)
      const errorMessage = error.message || error.details || 'メンテナンス記録の更新に失敗しました'
      throw new Error(errorMessage)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <h2 className="text-lg font-semibold text-red-800">エラー</h2>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
            <div className="mt-4">
              <Link href="/maintenance">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  一覧に戻る
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!record || !machine) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <p>データが見つかりません</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/maintenance">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              一覧に戻る
            </Button>
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            メンテナンス記録を編集
          </h1>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-sm font-medium text-gray-600 mb-2">対象プレス機</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">管理番号</p>
                <p className="font-mono font-semibold">{machine.machine_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">機械名</p>
                <p className="font-semibold">{machine.machine_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">種別</p>
                <p>{machine.machine_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">メーカー</p>
                <p>{machine.manufacturer}</p>
              </div>
            </div>
          </div>

          <MaintenanceForm
            machineId={machine.id}
            machineName={`${machine.machine_number} - ${machine.machine_name}`}
            onSubmit={handleUpdate}
            onCancel={() => router.push('/maintenance')}
            initialData={record}
            isEditMode={true}
          />
        </div>
      </main>
    </div>
  )
}