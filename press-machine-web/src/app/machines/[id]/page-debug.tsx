'use client'

import { useParams } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { getEffectiveOrgId } from '@/lib/org'

export default function DebugPage() {
  const params = useParams()
  const { user, profile, loading } = useAuth()
  const orgId = getEffectiveOrgId(profile)
  const machineId = params.id as string

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">デバッグ情報</h1>
      <div className="mt-4 space-y-2">
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? 'Logged in' : 'Not logged in'}</p>
        <p><strong>Profile:</strong> {profile ? JSON.stringify(profile) : 'None'}</p>
        <p><strong>OrgId:</strong> {orgId || 'None'}</p>
        <p><strong>Machine ID:</strong> {machineId}</p>
        <p><strong>Machine ID (Number):</strong> {Number(machineId)}</p>
        <p><strong>Is Valid Number:</strong> {!isNaN(Number(machineId)) ? 'Yes' : 'No'}</p>
      </div>
    </div>
  )
}