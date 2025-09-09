'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState('認証処理中...')

  useEffect(() => {
    const supabase = supabaseBrowser()
    
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback started')
        console.log('Current URL:', window.location.href)
        
        // URLからエラーをチェック
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const errorDescription = urlParams.get('error_description') || hashParams.get('error_description')
        
        console.log('URL params:', Object.fromEntries(urlParams))
        console.log('Hash params:', Object.fromEntries(hashParams))
        
        if (errorDescription) {
          console.error('Auth error:', errorDescription)
          setMessage('認証エラーが発生しました')
          setTimeout(() => {
            router.push('/auth/login?error=' + encodeURIComponent(errorDescription))
          }, 2000)
          return
        }

        setMessage('セッションを確認中...')
        
        // 少し待ってからセッションを取得（Supabaseの処理を待つ）
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Session:', session)
        console.log('Session error:', error)
        
        if (error) {
          console.error('Session error:', error)
          setMessage('セッション取得エラー')
          setTimeout(() => {
            router.push('/auth/login?error=' + encodeURIComponent(error.message))
          }, 2000)
          return
        }

        if (session) {
          console.log('Session found, user:', session.user.email)
          setMessage('ログイン成功！リダイレクトします...')
          
          // ユーザーのメールドメインをチェック
          const email = session.user.email || ''
          const allowedEmail = 'ibron1975@gmail.com'
          const allowedDomain = '@iidzka.co.jp'
          
          console.log('Email check:', email, allowedEmail, allowedDomain)
          
          if (email === allowedEmail || email.endsWith(allowedDomain)) {
            console.log('Email allowed, checking if password setup needed')
            
            // マジックリンクでログインした場合、パスワード設定を促す
            const urlParams = new URLSearchParams(window.location.search)
            const hashParams = new URLSearchParams(window.location.hash.substring(1))
            const type = hashParams.get('type')
            
            if (type === 'magiclink' || hashParams.get('access_token')) {
              // マジックリンクログインの場合はパスワード設定ページへ
              setMessage('パスワード設定ページにリダイレクトします...')
              setTimeout(() => {
                router.push('/auth/setup-password')
              }, 1000)
            } else {
              // 通常のログインの場合はダッシュボードへ
              setTimeout(() => {
                router.push('/')
              }, 1000)
            }
          } else {
            // 許可されていないメールアドレス
            console.log('Email not allowed:', email)
            await supabase.auth.signOut()
            setTimeout(() => {
              router.push('/auth/login?error=' + encodeURIComponent('このメールアドレスは使用できません'))
            }, 2000)
          }
        } else {
          console.log('No session found')
          setMessage('セッションが見つかりません')
          setTimeout(() => {
            router.push('/auth/login')
          }, 3000)
        }
      } catch (error) {
        console.error('Callback error:', error)
        setMessage('予期しないエラーが発生しました: ' + error.message)
        setTimeout(() => {
          router.push('/auth/login?error=callback_error')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{message}</p>
        <p className="mt-2 text-sm text-gray-500">少々お待ちください</p>
      </div>
    </div>
  )
}