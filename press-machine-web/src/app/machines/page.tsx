'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider-minimal'
import { getEffectiveOrgId } from '@/lib/org'
import { MachineTable } from '@/components/machines/MachineTable'
import { Header } from '@/components/layout/Header'
import { LoginForm } from '@/components/auth/LoginForm'
import { AlertCircle } from 'lucide-react'

export default function MachinesPage() {
  const supabase = supabaseBrowser()
  const { user, profile, loading } = useAuth()
  const [machines, setMachines] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const orgId = getEffectiveOrgId(profile)

  useEffect(() => {
    if (loading) return
    if (!user) { setError('ログインが必要です'); return }
    if (!orgId) { setError('組織が未設定です（org_id が見つかりません）'); return }

    let mounted = true
    ;(async () => {
      console.log('Loading machines for org:', orgId)
      const { data, error } = await supabase
        .from('press_machines')
        .select('*')
        .eq('org_id', orgId)
        .order('id', { ascending: true })

      if (!mounted) return
      if (error) { 
        console.error('Machines query error:', error)
        setError(error.message)
        return 
      }
      console.log('Machines loaded:', data?.length || 0, 'machines')
      setMachines(data ?? [])
    })()

    return () => { mounted = false }
  }, [loading, user, orgId, supabase])

  // Realtime購読は machines の取得後に一度だけ
  useEffect(() => {
    if (!orgId || machines === null) return
    
    console.log('Setting up realtime subscription for org:', orgId)
    const ch = supabase.channel('press_machines-ch')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'press_machines', 
        filter: `org_id=eq.${orgId}` 
      }, (payload) => {
        console.log('Realtime update received:', payload)
        // リロード
        supabase.from('press_machines').select('*').eq('org_id', orgId).order('id', { ascending: true }).then(({ data }) => {
          setMachines(data ?? [])
        })
      })
      .subscribe()
    
    return () => { 
      console.log('Cleaning up realtime subscription')
      supabase.removeChannel(ch) 
    }
  }, [orgId, machines, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">認証情報を確認中...</p>
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
            <p className="text-red-700 mt-2">プレス機情報の読み込み中にエラーが発生しました。ページを更新してもう一度お試しください。</p>
          </div>
        </div>
      </div>
    )
  }

  if (machines === null) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">プレス機データを読み込んでいます...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <MachineTable machines={machines} onRefresh={() => {
          // 手動リロード
          supabase.from('press_machines').select('*').eq('org_id', orgId!).then(({ data }) => {
            setMachines(data ?? [])
          })
        }} />
      </main>
    </div>
  )
}