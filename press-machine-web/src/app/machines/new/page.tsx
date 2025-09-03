'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { MachineForm } from '@/components/machines/MachineForm'
import { Header } from '@/components/layout/Header'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewMachinePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/machines')
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
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Link href="/machines">
              <Button variant="outline">← 戻る</Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">新規プレス機登録</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>プレス機情報</CardTitle>
          </CardHeader>
          <CardContent>
            <MachineForm onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}