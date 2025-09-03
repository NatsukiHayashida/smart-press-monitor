'use client'

import { createContext, useContext, useState } from 'react'

// 最小限の認証プロバイダー（認証機能は一時無効化）
type Ctx = { 
  user: any | null
  profile: any | null
  loading: boolean
}

const AuthCtx = createContext<Ctx>({ 
  user: null, 
  profile: null, 
  loading: false 
})

export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 固定値で一時的に対応
  const mockUser = {
    id: '8cb140d6-686f-4721-a493-abdf7342fb21',
    email: 'ibron1975@gmail.com',
    role: 'authenticated'
  }
  
  const mockProfile = {
    user_id: '8cb140d6-686f-4721-a493-abdf7342fb21',
    org_id: '5aa33531-921a-4425-a235-770ed1f524c5',
    email: null,
    full_name: null,
    created_at: '2025-09-02T06:47:07.413635+00:00'
  }

  return (
    <AuthCtx.Provider value={{ 
      user: mockUser, 
      profile: mockProfile, 
      loading: false 
    }}>
      {children}
    </AuthCtx.Provider>
  )
}