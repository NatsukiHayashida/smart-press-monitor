'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { Header } from '@/components/layout/Header'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  const { user, profile, loading } = useAuth()

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-2 text-gray-600">Smart Press Monitor へようこそ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                🏭 プレス機管理
              </CardTitle>
              <CardDescription>
                プレス機の登録・編集・削除を行います
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/machines">
                <Button className="w-full">プレス機一覧を見る</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                🔧 メンテナンス
              </CardTitle>
              <CardDescription>
                メンテナンス記録の登録・管理を行います
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/maintenance">
                <Button className="w-full">メンテナンス記録を見る</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                📊 分析・レポート
              </CardTitle>
              <CardDescription>
                データ分析とレポートを確認できます
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/analytics">
                <Button className="w-full">分析・レポートを見る</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {!profile?.org_id && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">⚠️ 組織への参加が必要です</CardTitle>
              <CardDescription className="text-yellow-700">
                システムを利用するには、組織への参加が必要です。管理者にお問い合わせください。
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  )
}
