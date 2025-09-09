'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabaseBrowser } from '@/lib/supabase/client'
import { AlertCircle, CheckCircle, Terminal } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DevSignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('Password123!')  // デフォルトパスワード
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = supabaseBrowser()
  const router = useRouter()

  // プリセットユーザー
  const presetUsers = [
    { email: 'admin@iidzka.co.jp', name: '管理者' },
    { email: 'user1@iidzka.co.jp', name: 'ユーザー1' },
    { email: 'user2@iidzka.co.jp', name: 'ユーザー2' },
    { email: 'ibron1975@gmail.com', name: 'テストユーザー' }
  ]

  const handleQuickSignUp = async (presetEmail: string) => {
    setEmail(presetEmail)
    await handleSignUp(null, presetEmail)
  }

  const handleSignUp = async (e: React.FormEvent | null, overrideEmail?: string) => {
    if (e) e.preventDefault()
    
    const targetEmail = overrideEmail || email
    
    setLoading(true)
    setMessage('')
    setSuccess(false)

    try {
      // まず既存ユーザーとしてログインを試みる
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password
      })

      if (loginData?.session) {
        setSuccess(true)
        setMessage('既存ユーザーとしてログインしました！')
        setTimeout(() => {
          router.push('/')
        }, 1500)
        return
      }

      // ログインできない場合は新規登録
      const { data, error } = await supabase.auth.signUp({
        email: targetEmail,
        password,
        options: {
          data: {
            email_confirm: true
          }
        }
      })

      if (error) {
        setMessage(`エラー: ${error.message}`)
      } else if (data?.user) {
        // 登録後すぐにログイン
        const { data: newLoginData, error: newLoginError } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password
        })
        
        if (newLoginData?.session) {
          setSuccess(true)
          setMessage('アカウント作成＆ログイン成功！')
          setTimeout(() => {
            router.push('/')
          }, 1500)
        } else {
          setSuccess(true)
          setMessage('アカウントが作成されました。ログインページからログインしてください。')
          setTimeout(() => {
            router.push('/auth/login')
          }, 2000)
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessage('エラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center flex items-center justify-center">
            <Terminal className="w-6 h-6 mr-2" />
            開発環境用 - 簡易登録
          </CardTitle>
          <CardDescription className="text-center">
            メール認証なしで即座にアカウント作成
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-yellow-800">
              ⚠️ 開発環境専用：本番環境では使用しないでください
            </p>
          </div>

          {/* クイック登録ボタン */}
          <div className="space-y-2 mb-4">
            <Label>クイック登録（ワンクリック）</Label>
            <div className="grid grid-cols-2 gap-2">
              {presetUsers.map((user) => (
                <Button
                  key={user.email}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSignUp(user.email)}
                  disabled={loading}
                  className="text-xs"
                >
                  {user.name}
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              パスワード: {password}
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">または</span>
            </div>
          </div>

          {/* カスタムメール登録 */}
          <form onSubmit={handleSignUp} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">カスタムメールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="test@iidzka.co.jp"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || success}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード（固定）</Label>
              <Input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || success}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading || success || !email}
            >
              {loading ? '処理中...' : '登録＆ログイン'}
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

          <div className="mt-6 text-center text-sm space-y-2">
            <Link
              href="/auth/login"
              className="block text-blue-600 hover:text-blue-800"
            >
              通常のログインページへ
            </Link>
            <Link
              href="/auth/signup"
              className="block text-gray-600 hover:text-gray-800"
            >
              通常の新規登録へ
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}