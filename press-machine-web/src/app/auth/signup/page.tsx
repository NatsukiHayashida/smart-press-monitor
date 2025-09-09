'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabaseBrowser } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const supabase = supabaseBrowser()
  const router = useRouter()

  // メールドメインのバリデーション
  const isValidEmail = (email: string): boolean => {
    const allowedEmail = 'ibron1975@gmail.com'
    const allowedDomain = '@iidzka.co.jp'
    
    return email === allowedEmail || email.endsWith(allowedDomain)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setSuccess(false)

    // メールドメインチェック
    if (!isValidEmail(email)) {
      setMessage('このメールアドレスは使用できません。@iidzka.co.jp のメールアドレスをご使用ください。')
      setLoading(false)
      return
    }

    // パスワードバリデーション
    if (password.length < 6) {
      setMessage('パスワードは6文字以上で入力してください。')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage('パスワードが一致しません。')
      setLoading(false)
      return
    }

    try {
      // 新規ユーザー登録
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email_confirm: true  // 開発環境用：メール確認をスキップ
          }
        }
      })

      if (error) {
        if (error.message.includes('User already registered')) {
          setMessage('このメールアドレスは既に登録されています。ログインページへお進みください。')
        } else {
          setMessage(`登録エラー: ${error.message}`)
        }
      } else if (data?.user) {
        // 登録成功後、自動的にログインを試みる
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        
        if (loginError) {
          setSuccess(true)
          setMessage('登録が完了しました！メール認証が必要な場合は、確認メールをご確認ください。認証不要な場合は、ログインページからログインしてください。')
          
          // 3秒後にログインページへリダイレクト
          setTimeout(() => {
            router.push('/auth/login')
          }, 3000)
        } else if (loginData?.session) {
          setSuccess(true)
          setMessage('登録が完了し、自動的にログインしました！ダッシュボードへリダイレクトします...')
          
          // 2秒後にダッシュボードへリダイレクト
          setTimeout(() => {
            router.push('/')
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Signup error:', error)
      setMessage('登録に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">新規登録</CardTitle>
          <CardDescription className="text-center">
            Smart Press Monitor アカウントを作成
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="your-email@iidzka.co.jp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || success}
              />
              <p className="text-xs text-gray-500">
                @iidzka.co.jp のメールアドレスで登録できます
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="6文字以上で入力"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワードの確認</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="パスワードを再入力"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading || success || !email || !password || !confirmPassword}
            >
              {loading ? '登録処理中...' : 'アカウントを作成'}
            </Button>
          </form>
          
          {message && (
            <div className={`mt-4 text-sm p-3 rounded-md flex items-start ${
              success
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {success ? (
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
              )}
              <span>{message}</span>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">既にアカウントをお持ちの方は</span>
            <Link
              href="/auth/login"
              className="ml-1 font-medium text-blue-600 hover:text-blue-800"
            >
              ログインへ
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}