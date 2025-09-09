'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabaseBrowser } from '@/lib/supabase/client'
import { AlertCircle, Mail } from 'lucide-react'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [loginMode, setLoginMode] = useState<'magic-link' | 'password'>('password')
  const supabase = supabaseBrowser()

  // URLパラメータからエラーメッセージを取得
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    if (error) {
      setMessage(`エラー: ${decodeURIComponent(error)}`)
    }
  }, [])

  // メールドメインのバリデーション
  const isValidEmail = (email: string): boolean => {
    const allowedEmail = 'ibron1975@gmail.com'
    const allowedDomain = '@iidzka.co.jp'
    
    return email === allowedEmail || email.endsWith(allowedDomain)
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // メールドメインチェック
    if (!isValidEmail(email)) {
      setMessage('このメールアドレスは使用できません。@iidzka.co.jp のメールアドレスをご使用ください。')
      setLoading(false)
      return
    }

    // パスワード入力チェック
    if (!password || password.length < 6) {
      setMessage('パスワードは6文字以上で入力してください。')
      setLoading(false)
      return
    }

    try {
      console.log('Attempting login with:', email)
      
      // ユーザーが入力したパスワードでログイン試行
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      console.log('Login response:', { data, error })

      if (error) {
        console.error('Login error:', error)
        
        if (error.message.includes('Invalid login credentials')) {
          setMessage('メールアドレスまたはパスワードが正しくありません。パスワードをお忘れの場合は「パスワードを忘れた方」をクリックしてください。')
        } else if (error.message.includes('Email not confirmed')) {
          setMessage('メールアドレスの確認が必要です。受信メールをご確認ください。')
        } else {
          setMessage(`ログインエラー: ${error.message}`)
        }
      } else if (data?.session) {
        console.log('Login successful!')
        setMessage('ログイン成功！リダイレクトします...')
        
        // 少し待ってからリダイレクト
        setTimeout(() => {
          if (onSuccess) {
            onSuccess()
          } else {
            window.location.href = '/'
          }
        }, 1000)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setMessage('ログインに失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // メールドメインチェック
    if (!isValidEmail(email)) {
      setMessage('このメールアドレスは使用できません。@iidzka.co.jp のメールアドレスをご使用ください。')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setMessage(`エラー: ${error.message}`)
      } else {
        setMessage('メールアドレスに認証リンクを送信しました。メールを確認してください。')
      }
    } catch (error) {
      setMessage('ログインに失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">🤖 Smart Press Monitor</CardTitle>
        <CardDescription className="text-center">
          スマートプレス機監視システム - メールアドレスでログインしてください
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* ログイン方法切り替えタブ */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-4">
          <button
            type="button"
            onClick={() => setLoginMode('password')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              loginMode === 'password'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            パスワードログイン
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('magic-link')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              loginMode === 'magic-link'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            メール認証
          </button>
        </div>

        {loginMode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="your-email@iidzka.co.jp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="パスワードを入力"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                ※ 6文字以上のパスワードを入力してください
              </p>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email || !password}
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
            
            <div className="mt-2 text-center space-y-2">
              <a
                href="/auth/reset-password"
                className="block text-sm text-blue-600 hover:text-blue-800 underline"
              >
                パスワードを忘れた方
              </a>
              <div className="text-sm text-gray-600">
                初めてご利用の方は
                <a
                  href="/auth/signup"
                  className="ml-1 font-medium text-blue-600 hover:text-blue-800"
                >
                  新規登録へ
                </a>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-magic">メールアドレス</Label>
              <Input
                id="email-magic"
                type="email"
                placeholder="your-email@iidzka.co.jp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                @iidzka.co.jp のメールアドレスでログインできます
              </p>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !email}
            >
              <Mail className="w-4 h-4 mr-2" />
              {loading ? 'ログインリンクを送信中...' : 'ログインリンクを送信'}
            </Button>
            
            <div className="mt-2 text-center">
              <div className="text-sm text-gray-600">
                初めてご利用の方は
                <a
                  href="/auth/signup"
                  className="ml-1 font-medium text-blue-600 hover:text-blue-800"
                >
                  新規登録へ
                </a>
              </div>
            </div>
          </form>
        )}
        
        {message && (
          <div className={`mt-4 text-sm p-3 rounded-md flex items-start ${
            message.includes('エラー') || message.includes('使用できません')
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {(message.includes('エラー') || message.includes('使用できません')) && (
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            )}
            <span>{message}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}