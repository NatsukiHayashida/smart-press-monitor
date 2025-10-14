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
          // APIからプロファイルを取得
          const response = await fetch('/api/profile')
          if (response.ok) {
            const profileData = await response.json()
            setProfile(profileData)
          } else {
            console.error('プロファイル取得失敗:', response.statusText)
            setProfile(null)
          }
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