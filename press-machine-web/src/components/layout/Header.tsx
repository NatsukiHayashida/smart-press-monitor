'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { LogOut, User, Menu, X } from 'lucide-react'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export function Header() {
  const { user, profile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-background shadow-sm border-b border-border print-hide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-lg sm:text-xl font-bold text-foreground">
              Smart Press Monitor
            </Link>

            {user && (
              <nav className="hidden md:flex space-x-4">
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

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                {/* デスクトップ表示 */}
                <div className="hidden sm:flex items-center space-x-3">
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

                {/* モバイル表示 */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                    <SheetTitle className="sr-only">メニュー</SheetTitle>
                    <div className="flex flex-col space-y-6 mt-6">
                      {/* ユーザー情報 */}
                      <div className="flex items-center space-x-2 bg-muted/50 px-3 py-3 rounded-md">
                        <User className="w-5 h-5 text-primary" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground truncate">
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

                      {/* ナビゲーションリンク */}
                      <nav className="flex flex-col space-y-2">
                        <Link
                          href="/machines"
                          className="text-foreground hover:bg-muted px-3 py-3 rounded-md text-sm font-medium transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          プレス機一覧
                        </Link>
                        <Link
                          href="/maintenance"
                          className="text-foreground hover:bg-muted px-3 py-3 rounded-md text-sm font-medium transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          メンテナンス
                        </Link>
                        <Link
                          href="/analytics"
                          className="text-foreground hover:bg-muted px-3 py-3 rounded-md text-sm font-medium transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          統計・レポート
                        </Link>
                      </nav>

                      {/* ログアウトボタン */}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMobileMenuOpen(false)
                          signOut()
                        }}
                        className="flex items-center justify-center space-x-2 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>ログアウト</span>
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <Link href="/auth/sign-in">
                <Button size="sm">ログイン</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}