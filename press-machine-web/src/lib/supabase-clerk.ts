'use client'

import { createClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'
import { Database } from '@/types/database'
import { useMemo } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// グローバルなクライアント管理のためのMap
const clientInstances = new Map<string, ReturnType<typeof createClient<Database>>>()

// ClerkユーザーIDをカスタムヘッダーとして送信するSupabaseクライアント
export function useSupabaseClient() {
  const { userId, orgId } = useAuth()

  // useMemoとMapを使ってシングルトンパターンを実装
  const supabase = useMemo(() => {
    const key = `${userId || 'no-user'}-${orgId || 'no-org'}`

    // 既存のインスタンスがあれば再利用
    if (clientInstances.has(key)) {
      return clientInstances.get(key)!
    }

    // 新しいインスタンスを作成
    const newClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storage: undefined,
      },
      global: {
        headers: {
          // ClerkユーザーIDをカスタムヘッダーとして送信
          'x-clerk-user-id': userId || '',
          'x-clerk-org-id': orgId || '',
        },
      },
    })

    // Mapに保存
    clientInstances.set(key, newClient)

    console.log('🔐 New Supabase client created with Clerk headers:', {
      userId: userId || 'no-user',
      orgId: orgId || 'no-org',
      totalInstances: clientInstances.size
    })

    return newClient
  }, [userId, orgId])

  return supabase
}

// サーバーサイド用のSupabaseクライアント（Service Role使用）
export const createServerSupabaseClient = (userId?: string, orgId?: string) => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  // Service Role Keyが利用可能な場合は使用（RLSをバイパス）
  if (serviceRoleKey) {
    return createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          // サーバーサイドでもClerkヘッダーを送信（オプション）
          'x-clerk-user-id': userId || '',
          'x-clerk-org-id': orgId || '',
        },
      },
    })
  }
  
  // Service Role Keyがない場合は通常のクライアント
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'x-clerk-user-id': userId || '',
        'x-clerk-org-id': orgId || '',
      },
    },
  })
}