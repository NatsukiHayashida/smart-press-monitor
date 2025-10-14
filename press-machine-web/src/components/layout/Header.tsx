'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

export function Header() {
  const { user, profile, signOut } = useAuth()

  return (
    <header className="bg-background shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-foreground">
              Smart Press Monitor
            </Link>

            {user && (
              <nav className="flex space-x-4">
                <Link
                  href="/machines"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  プレス機一覧
                </Link>
                <Link
                  href="/maintenance"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  メンテナンス
                </Link>
                <Link
                  href="/analytics"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  統計・レポート
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-muted/50 px-3 py-2 rounded-md">
                  <User className="w-5 h-5 text-primary" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {profile?.email || user.email}
                    </span>
                    {profile?.role && (
                      <span className={`text-xs ${
                        profile.role === 'admin'
                          ? 'text-primary font-semibold'
                          : 'text-muted-foreground'
                      }`}>
                        {profile.role === 'admin' ? '管理者' : '閲覧者'}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ログアウト</span>
                </Button>
              </div>
            ) : (
              <Link href="/auth/sign-in">
                <Button>ログイン</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}