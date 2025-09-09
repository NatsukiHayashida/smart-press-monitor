'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = supabaseBrowser()

  // メールドメインのバリデーション
  const isValidEmail = (email: string): boolean => {
    const allowedEmail = 'ibron1975@gmail.com'
    const allowedDomain = '@iidzka.co.jp'
    
    return email === allowedEmail || email.endsWith(allowedDomain)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // メールドメインチェック
    if (!isValidEmail(email)) {
      setMessage('このメールアドレスは使用できません。@iidzka.co.jp のメールアドレスをご使用ください。')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`
      })

      if (error) {
        setMessage(`エラー: ${error.message}`)
      } else {
        setSuccess(true)
        setMessage('パスワードリセットのメールを送信しました。メールをご確認ください。')
      }
    } catch (error) {
      setMessage('パスワードリセットに失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>パスワードをリセット</CardTitle>
          <CardDescription>
            登録されているメールアドレスにパスワードリセットのリンクを送信します
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!success ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@iidzka.co.jp"
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  @iidzka.co.jp のメールアドレスを入力してください
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full"
              >
                {loading ? 'リセットメールを送信中...' : 'リセットメールを送信'}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <p className="text-sm text-gray-600">
                メールを送信しました。受信メールをご確認ください。
              </p>
            </div>
          )}

          {message && !success && (
            <div className="p-3 rounded-md flex items-start bg-red-50 text-red-700 border border-red-200">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{message}</span>
            </div>
          )}

          {message && success && (
            <div className="p-3 rounded-md flex items-start bg-green-50 text-green-700 border border-green-200">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{message}</span>
            </div>
          )}

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => router.push('/auth/login')}
              className="text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ログインページに戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}