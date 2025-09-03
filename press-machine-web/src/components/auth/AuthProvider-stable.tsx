'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

type Ctx = { user: any | null; profile: any | null; loading: boolean }
const AuthCtx = createContext<Ctx>({ user: null, profile: null, loading: true })
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => supabaseBrowser(), []) // ← 毎レンダで変わらない
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const initRef = useRef(false) // 初期化フラグ

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    let mounted = true
    const initAuth = async () => {
      try {
        console.log('Initializing auth...')
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Session result:', { session: !!session, error })
        
        if (!mounted) return
        setUser(session?.user ?? null)

        if (session?.user?.id) {
          console.log('Loading profile for user:', session.user.id)
          const { data: prof, error } = await supabase.from('profiles').select('*').eq('user_id', session.user.id).maybeSingle()
          console.log('Profile result:', { profile: !!prof, error })
          if (!mounted) return
          if (error) console.error('load profile error', error)
          setProfile(prof ?? null)
        } else {
          setProfile(null)
        }
      } catch (e) {
        console.error('Auth initialization error:', e)
      } finally {
        if (mounted) {
          console.log('Auth initialization complete')
          setLoading(false)
        }
      }
    }

    // タイムアウトを設定（5秒）
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timeout')
        setLoading(false)
      }
    }, 5000)

    initAuth()

    // auth state change - reload profile on login
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, sess) => {
      console.log('Auth state changed:', event, sess?.user?.email)
      setUser(sess?.user ?? null)
      
      // Reload profile when user logs in
      if (sess?.user?.id && event === 'SIGNED_IN') {
        const { data: prof, error } = await supabase.from('profiles').select('*').eq('user_id', sess.user.id).maybeSingle()
        if (error) console.error('reload profile error', error)
        setProfile(prof ?? null)
      } else if (!sess?.user) {
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeout)
      sub?.subscription?.unsubscribe()
    }
  }, [supabase])

  return <AuthCtx.Provider value={{ user, profile, loading }}>{children}</AuthCtx.Provider>
}