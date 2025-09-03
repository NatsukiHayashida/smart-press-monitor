'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabaseBrowser } from '@/lib/supabase/client'
import { Profile } from '@/types/database'

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

  const loadProfile = async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId)
      
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      console.log('Profile query result:', { profile, profileError })

      // プロフィールが存在しない場合は作成
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Creating new profile...')
        const defaultOrgId = 'c897453e-14c7-4335-bdb4-91978778d95b'
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            org_id: defaultOrgId,
            email: user?.email,
            full_name: user?.user_metadata?.full_name || user?.email
          } as any)
          .select()
          .single()
        
        console.log('Profile creation result:', { newProfile, createError })
        
        if (createError) {
          console.error('Failed to create profile:', createError)
          // プロフィール作成に失敗した場合、デフォルト値を設定
          profile = {
            user_id: userId,
            org_id: defaultOrgId,
            email: user?.email || null,
            full_name: user?.user_metadata?.full_name || user?.email || null,
            created_at: new Date().toISOString()
          }
        } else {
          profile = newProfile
        }
      }
      // プロフィールはあるがorg_idがない場合
      else if (profile && !profile.org_id) {
        console.log('Updating profile with org_id...')
        const defaultOrgId = 'c897453e-14c7-4335-bdb4-91978778d95b'
        
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ org_id: defaultOrgId })
          .eq('user_id', userId)
          .select()
          .single()
        
        console.log('Profile update result:', { updatedProfile, updateError })
        
        if (!updateError && updatedProfile) {
          profile = updatedProfile
        } else {
          // 更新に失敗した場合、メモリ上で設定
          profile = { ...profile, org_id: defaultOrgId }
        }
      }
      
      console.log('Final profile:', profile)
      setProfile(profile)
    } catch (error) {
      console.error('Profile loading error:', error)
      // エラーの場合でもデフォルト値を設定
      const defaultOrgId = 'c897453e-14c7-4335-bdb4-91978778d95b'
      setProfile({
        user_id: userId,
        org_id: defaultOrgId,
        email: user?.email || null,
        full_name: user?.user_metadata?.full_name || user?.email || null,
        created_at: new Date().toISOString()
      })
    }
  }

  useEffect(() => {
    let isMounted = true

    const getSession = async () => {
      try {
        console.log('Getting initial session...')
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        console.log('Initial session:', session?.user?.id ? 'Found' : 'None')
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
      } catch (error) {
        console.error('Session error:', error)
        if (isMounted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        console.log('Auth state change:', event, session?.user?.id ? 'User found' : 'No user')
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        if (isMounted) {
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
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