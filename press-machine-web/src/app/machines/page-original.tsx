'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabaseBrowser } from '@/lib/supabase/client'
import { PressMachine } from '@/types/database'
import { MachineTable } from '@/components/machines/MachineTable'
import { Header } from '@/components/layout/Header'
import { LoginForm } from '@/components/auth/LoginForm'

export default function MachinesPage() {
  const { user, profile, loading } = useAuth()
  const [machines, setMachines] = useState<PressMachine[]>([])
  const [loadingMachines, setLoadingMachines] = useState(true)
  const supabase = supabaseBrowser()

  useEffect(() => {
    if (!user || !profile?.org_id) return

    loadMachines()

    // Realtime subscription
    const channel = supabase
      .channel('press_machines_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'press_machines',
          filter: `org_id=eq.${profile.org_id}`,
        },
        () => {
          loadMachines()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, profile?.org_id])

  const loadMachines = async () => {
    if (!profile?.org_id) return

    setLoadingMachines(true)
    const { data, error } = await supabase
      .from('press_machines')
      .select('*')
      .eq('org_id', profile.org_id)
      .order('machine_number', { ascending: true })

    if (error) {
      console.error('Error loading machines:', error)
    } else {
      setMachines(data || [])
    }
    setLoadingMachines(false)
  }

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {loadingMachines ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">データを読み込んでいます...</p>
          </div>
        ) : (
          <MachineTable machines={machines} onRefresh={loadMachines} />
        )}
      </main>
    </div>
  )
}