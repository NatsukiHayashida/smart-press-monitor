'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { getEffectiveOrgId } from '@/lib/org'
import { PressMachine } from '@/types/database'
import { MachineFormExpanded } from '@/components/machines/MachineFormExpanded'
import { Header } from '@/components/layout/Header'
import { LoginForm } from '@/components/auth/LoginForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function MachineEditPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [machine, setMachine] = useState<PressMachine | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = createClient()
  const orgId = getEffectiveOrgId(profile)
  const machineId = params?.id as string

  useEffect(() => {
    if (loading || !user || !orgId) return

    const loadMachine = async () => {
      const { data, error } = await supabase
        .from('press_machines')
        .select('*')
        .eq('id', machineId)
        .eq('org_id', orgId)
        .single()

      if (error) {
        setError('プレス機情報の読み込み中にエラーが発生しました。')
        console.error('Machine loading error:', error)
      } else {
        setMachine(data)
      }
      setIsLoading(false)
    }

    loadMachine()
  }, [loading, user, orgId, machineId, supabase])

  const handleSuccess = () => {
    router.push(`/machines/${machineId}`)
  }

  const handleCancel = () => {
    router.push(`/machines/${machineId}`)
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">プレス機情報を読み込んでいます...</p>
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

  if (error || !machine) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between mb-6">
            <Link href={`/machines/${machineId}`}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                プレス機詳細に戻る
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* ヘッダーセクション */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <Link href={`/machines/${machineId}`}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                プレス機編集 #{machine.machine_number}
              </h1>
              <p className="text-gray-600">
                プレス機の詳細情報を編集します
              </p>
            </div>
          </div>
        </div>

        {/* 編集フォーム */}
        <MachineFormExpanded 
          machine={machine}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </main>
    </div>
  )
}