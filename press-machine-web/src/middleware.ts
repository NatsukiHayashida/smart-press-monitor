import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 認証不要なパス
const publicPaths = [
  '/auth/login',
  '/auth/callback',
  '/api/auth',
  '/_next',
  '/favicon.ico'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 公開パスはスキップ
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // 一旦、認証チェックを簡略化（クライアント側で処理）
  // middlewareでの複雑な認証チェックは避け、クライアント側のAuthProviderに委ねる
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)  
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}