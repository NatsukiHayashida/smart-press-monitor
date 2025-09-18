'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabaseBrowser } from '@/lib/supabase/client'
import { MaintenanceRecordWithMachine } from '@/types/database'
import { MaintenanceTable } from '@/components/maintenance/MaintenanceTable'
import { MaintenanceForm } from '@/components/maintenance/MaintenanceForm'
import { Header } from '@/components/layout/Header'
import { LoginForm } from '@/components/auth/LoginForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export default function MaintenancePage() {
  const { user, profile, loading } = useAuth()
  const [records, setRecords] = useState<MaintenanceRecordWithMachine[]>([])
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const supabase = supabaseBrowser()

  useEffect(() => {
    if (!user || !profile?.org_id) return

    loadRecords()

    // Realtime subscription
    const channel = supabase
      .channel('maintenance_records_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_records',
          filter: `org_id=eq.${profile.org_id}`,
        },
        () => {
          loadRecords()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, profile?.org_id])

  const loadRecords = async () => {
    if (!profile?.org_id) return

    setLoadingRecords(true)
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
      .eq('org_id', profile.org_id)
      .order('maintenance_datetime', { ascending: false })

    if (error) {
      console.error('Error loading records:', error)
    } else {
      setRecords(data || [])
    }
    setLoadingRecords(false)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    loadRecords()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loadingRecords ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">データを読み込んでいます...</p>
          </div>
        ) : (
          <MaintenanceTable 
            records={records} 
            onRefresh={loadRecords} 
            onNew={() => setShowForm(true)}
          />
        )}
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