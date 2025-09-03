'use client'

import { useAuth } from '@/components/auth/AuthProvider-minimal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getEffectiveOrgId } from '@/lib/org'

export default function HomeWithAuth() {
  const { user, profile, loading } = useAuth()
  const orgId = getEffectiveOrgId(profile)

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Smart Press Monitor</CardTitle>
            <CardDescription>
              ログインが必要です
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/login">
              <Button className="w-full">ログインページへ</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Smart Press Monitor</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              ようこそ、{user.email}さん
            </span>
            <Button variant="outline" size="sm">
              ログアウト
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">ダッシュボード</h2>
          <p className="mt-2 text-gray-600">Smart Press Monitor へようこそ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        
        <div className="mt-8">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">✅ 認証・プロフィール取得成功</CardTitle>
              <CardDescription className="text-green-700">
                ユーザー: {user.email}<br/>
                プロフィールID: {profile?.user_id || '未設定'}<br/>
                プロフィール組織ID: {profile?.org_id || '未設定'}<br/>
                有効組織ID: {orgId || '取得失敗'}<br/>
                安定版認証プロバイダーが正常に動作しています！
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  )
}