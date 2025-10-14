import { NextResponse } from 'next/server'
import { getCurrentUserPermissions } from '@/lib/permissions'

export async function GET() {
  try {
    const permissions = await getCurrentUserPermissions()

    return NextResponse.json({
      user_id: permissions.userId,
      email: permissions.email,
      full_name: permissions.fullName,
      org_id: permissions.orgId,
      role: permissions.role,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('プロファイルAPI エラー:', error)
    return NextResponse.json(
      { error: 'プロファイルの取得に失敗しました' },
      { status: 500 }
    )
  }
}
