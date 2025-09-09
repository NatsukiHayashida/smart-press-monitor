'use client'

import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabaseBrowser } from '@/lib/supabase/client'
import { Profile } from '@/types/database'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = supabaseBrowser()
  const router = useRouter()
  const pathname = usePathname()
  const routerRef = useRef(router)
  const pathnameRef = useRef(pathname)
  
  // refを更新
  routerRef.current = router
  pathnameRef.current = pathname

  useEffect(() => {
    // 初回認証状態チェック
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        // リフレッシュトークンエラーの場合はセッションをクリア
        if (error?.message?.includes('Invalid Refresh Token') || error?.message?.includes('Refresh Token Not Found')) {
          console.log('Invalid refresh token, clearing session')
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }
        
        console.log('Initial session:', session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // プロフィール取得をスキップ（user_profilesテーブルが存在しない場合）
          // 代わりにモックプロフィールを作成
          const mockProfile = {
            user_id: session.user.id,
            org_id: '5aa33531-921a-4425-a235-770ed1f524c5', // デフォルト組織ID
            email: session.user.email,
            full_name: null,
            created_at: new Date().toISOString()
          }
          setProfile(mockProfile)
        } else {
          setProfile(null)
        }
        
      } catch (error) {
        console.error('Session error:', error)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)
        
        // リフレッシュトークンエラーの場合は即座にクリア
        if (event === 'TOKEN_REFRESHED' && !session) {
          setUser(null)
          setProfile(null)
          setLoading(false)
          if (!pathnameRef.current?.startsWith('/auth')) {
            routerRef.current.push('/auth/login')
          }
          return
        }
        
        try {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            // プロフィール取得をスキップ（user_profilesテーブルが存在しない場合）
            // 代わりにモックプロフィールを作成
            const mockProfile = {
              user_id: session.user.id,
              org_id: '5aa33531-921a-4425-a235-770ed1f524c5', // デフォルト組織ID
              email: session.user.email,
              full_name: null,
              created_at: new Date().toISOString()
            }
            setProfile(mockProfile)
            
            // ログイン成功時、リダイレクトパラメータがあればそこへ、なければホームへ
            if (event === 'SIGNED_IN' && pathnameRef.current === '/auth/login') {
              const params = new URLSearchParams(window.location.search)
              const redirectTo = params.get('redirect') || '/'
              routerRef.current.push(redirectTo)
            }
          } else {
            setProfile(null)
            
            // 未認証の場合、ログインページ以外からはリダイレクト（callbackページは除外）
            if (event === 'SIGNED_OUT' && !pathnameRef.current?.startsWith('/auth')) {
              routerRef.current.push('/auth/login')
            }
          }
        } catch (error) {
          console.error('Auth state change error:', error)
          setUser(null)
          setProfile(null)
        } finally {
          // 初回以降のローディング状態はfalseに
          if (event !== 'INITIAL_SESSION') {
            setLoading(false)
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/auth/login')
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}