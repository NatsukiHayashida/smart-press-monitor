'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { getEffectiveOrgId } from '@/lib/org'
import { Header } from '@/components/layout/Header'
import { MaintenanceForm } from '@/components/maintenance/MaintenanceForm'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Machine {
  id: number
  machine_number: string
  machine_name: string
  machine_type: string
  manufacturer: string
}

export default function NewMaintenancePage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [machine, setMachine] = useState<Machine | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = supabaseBrowser()
  const orgId = getEffectiveOrgId(profile)
  
  const machineId = searchParams.get('machineId')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (!authLoading && user && orgId && machineId) {
      loadMachine()
    }
  }, [authLoading, user, orgId, machineId])

  const loadMachine = async () => {
    if (!orgId || !machineId) return

    const parsedMachineId = parseInt(machineId, 10)
    if (isNaN(parsedMachineId)) {
      setError('無効なプレス機IDです')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('Loading machine with ID:', parsedMachineId, 'orgId:', orgId)
      
      const { data: machineData, error: machineError } = await supabase
        .from('press_machines')
        .select('*')
        .eq('id', parsedMachineId)
        .eq('org_id', orgId)
        .single()

      console.log('Machine query result:', { machineData, machineError })

      if (machineError) {
        console.error('Machine error details:', machineError)
        throw new Error(`プレス機情報の取得エラー: ${machineError.message}`)
      }
      
      if (!machineData) {
        throw new Error('プレス機が見つかりません')
      }

      setMachine(machineData)

    } catch (error: any) {
      console.error('Loading error:', error)
      setError(error.message || 'データの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    // 成功時はプレス機詳細ページまたは元のページに戻る
    if (machineId) {
      router.push(`/machines/${machineId}`)
    } else {
      router.push('/maintenance')
    }
  }

  const handleCancel = () => {
    if (machineId) {
      router.push(`/machines/${machineId}`)
    } else {
      router.push('/maintenance')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
              <Button variant="outline" onClick={handleCancel}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            メンテナンス記録登録
          </h1>
          
          {machine && (
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
          )}

          <MaintenanceForm
            machineId={machine?.id}
            machineName={machine ? `${machine.machine_number} - ${machine.machine_name}` : undefined}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </main>
    </div>
  )
}