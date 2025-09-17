'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter()

  const handleLogin = () => {
    router.push('/auth/sign-in')
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Smart Press Monitor</CardTitle>
        <CardDescription>プレス機メンテナンス管理システム</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleLogin} 
          className="w-full"
        >
          ログインページへ
        </Button>
      </CardContent>
    </Card>
  )
}