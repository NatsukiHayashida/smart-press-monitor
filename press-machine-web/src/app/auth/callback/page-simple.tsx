'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // シンプルなリダイレクト
    console.log('Auth callback - redirecting to home')
    setTimeout(() => {
      router.push('/')
    }, 1000)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">ログイン処理中...</p>
        <p className="mt-2 text-sm text-gray-500">ダッシュボードにリダイレクトします</p>
      </div>
    </div>
  )
}