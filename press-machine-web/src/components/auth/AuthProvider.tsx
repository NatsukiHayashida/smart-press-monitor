'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs'
import { Profile } from '@/types/database'

interface AuthContextType {
  user: any | null
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
  const { user, isLoaded } = useUser()
  const { signOut: clerkSignOut } = useClerkAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) {
      setLoading(true)
      return
    }

    const loadProfile = async () => {
      try {
        if (user) {
          // TODO: Clerkユーザー情報からプロファイルを取得
          // 現時点では簡易的なプロファイル設定
          setProfile({
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            full_name: user.fullName || '',
            org_id: null,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as Profile)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error('プロファイル読み込みエラー:', error)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, isLoaded])

  const signOut = async () => {
    try {
      await clerkSignOut()
      setProfile(null)
    } catch (error) {
      console.error('サインアウトエラー:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading: !isLoaded || loading,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}