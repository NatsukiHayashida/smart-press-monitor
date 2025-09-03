'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'

export function Header() {
  const { user, profile, signOut } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-gray-900">
              🤖 Smart Press Monitor
            </Link>
            
            {user && (
              <nav className="flex space-x-4">
                <Link 
                  href="/machines" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  プレス機一覧
                </Link>
                <Link 
                  href="/maintenance" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  メンテナンス
                </Link>
                <Link 
                  href="/analytics" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  分析・レポート
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {profile?.full_name || user.email}
                </span>
                <Button variant="outline" onClick={signOut}>
                  ログアウト
                </Button>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button>ログイン</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}