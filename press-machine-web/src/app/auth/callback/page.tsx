'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = supabaseBrowser()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URLのhashパラメータを処理
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          // トークンがあれば設定
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            console.error('Session setting error:', error)
            router.push('/auth/login?error=' + encodeURIComponent(error.message))
            return
          }

          if (data.session) {
            // ログイン成功 - ダッシュボードにリダイレクト
            router.push('/')
            return
          }
        }

        // フォールバック: 現在のセッションをチェック
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          router.push('/auth/login?error=' + encodeURIComponent(error.message))
          return
        }

        if (data.session) {
          // ログイン成功 - ダッシュボードにリダイレクト
          router.push('/')
        } else {
          // セッションがない - ログインページにリダイレクト
          router.push('/auth/login?message=session_expired')
        }
      } catch (error) {
        console.error('Callback processing error:', error)
        router.push('/auth/login?error=callback_error')
      }
    }

    // 少し待ってから処理開始（URLパラメータが設定されるのを待つ）
    const timer = setTimeout(handleAuthCallback, 100)
    
    return () => clearTimeout(timer)
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">認証処理中...</p>
        <p className="mt-2 text-sm text-gray-500">少々お待ちください</p>
      </div>
    </div>
  )
}