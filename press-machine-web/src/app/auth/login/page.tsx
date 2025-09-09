'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { useAuth } from '@/components/auth/AuthProvider'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // ユーザーが既にログイン済みの場合はホームへリダイレクト
    if (!loading && user) {
      const params = new URLSearchParams(window.location.search)
      const redirectTo = params.get('redirect') || '/'
      router.push(redirectTo)
    }
  }, [user, loading, router])

  // ログインページは常に表示（ローディング画面を表示しない）
  // 既にログインしている場合は上のuseEffectでリダイレクトされる
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm onSuccess={() => {
        const params = new URLSearchParams(window.location.search)
        const redirectTo = params.get('redirect') || '/'
        router.push(redirectTo)
      }} />
    </div>
  )
}