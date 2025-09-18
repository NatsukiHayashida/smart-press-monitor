'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import { getEffectiveOrgId } from '@/lib/org'
import { MaintenanceTable } from '@/components/maintenance/MaintenanceTable'
import { MaintenanceForm } from '@/components/maintenance/MaintenanceForm'
import { Header } from '@/components/layout/Header'
import { LoginForm } from '@/components/auth/LoginForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertCircle } from 'lucide-react'

export default function MaintenancePage() {
  const supabase = createClient()
  const { user, profile, loading } = useAuth()
  const [records, setRecords] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const orgId = getEffectiveOrgId(profile)

  useEffect(() => {
    if (loading) return
    if (!user) { setError('ログインが必要です'); return }
    if (!orgId) { setError('組織が未設定です（org_id が見つかりません）'); return }

    let mounted = true
    ;(async () => {
      console.log('Loading maintenance records for org:', orgId)
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
        .eq('org_id', orgId)
        .order('maintenance_date', { ascending: false })

      if (!mounted) return
      if (error) { 
        console.error('Maintenance records query error:', error)
        setError(error.message)
        return 
      }
      console.log('Maintenance records loaded:', data?.length || 0, 'records')
      setRecords(data ?? [])
    })()

    return () => { mounted = false }
  }, [loading, user, orgId, supabase])

  // Realtime購読
  useEffect(() => {
    if (!orgId || records === null) return
    
    console.log('Setting up maintenance realtime subscription for org:', orgId)
    const ch = supabase.channel('maintenance_records-ch')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'maintenance_records', 
        filter: `org_id=eq.${orgId}` 
      }, (payload) => {
        console.log('Maintenance realtime update received:', payload)
        // リロード
        supabase.from('maintenance_records').select(`
          *,
          press_machines (
            machine_number,
            manufacturer,
            model_type
          )
        `).eq('org_id', orgId).order('maintenance_date', { ascending: false }).then(({ data }) => {
          setRecords(data ?? [])
        })
      })
      .subscribe()
    
    return () => { 
      console.log('Cleaning up maintenance realtime subscription')
      supabase.removeChannel(ch) 
    }
  }, [orgId, records, supabase])

  const handleFormSuccess = () => {
    setShowForm(false)
    // データを再読み込み
    if (orgId) {
      supabase.from('maintenance_records').select(`
        *,
        press_machines (
          machine_number,
          manufacturer,
          model_type
        )
      `).eq('org_id', orgId).order('maintenance_date', { ascending: false }).then(({ data, error }) => {
        console.log('Maintenance records query result:', { data, error })
        if (error) {
          console.error('Maintenance records query error:', error)
          setError(error.message)
        } else {
          setRecords(data ?? [])
        }
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
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
            <p className="text-red-700 mt-2">メンテナンス記録の読み込み中にエラーが発生しました。ページを更新してもう一度お試しください。</p>
          </div>
        </div>
      </div>
    )
  }

  if (records === null) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <MaintenanceTable 
          records={records} 
          onRefresh={() => {
            // 手動リロード
            if (orgId) {
              supabase.from('maintenance_records').select(`
                *,
                press_machines (
                  machine_number,
                  manufacturer,
                  model_type
                )
              `).eq('org_id', orgId).then(({ data }) => {
                setRecords(data ?? [])
              })
            }
          }}
          onNew={() => setShowForm(true)}
        />
      </main>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>メンテナンス記録登録</DialogTitle>
          </DialogHeader>
          <MaintenanceForm 
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}