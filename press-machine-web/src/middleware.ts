import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/sign-in(.*)',
  '/auth/sign-up(.*)',
  '/api/webhooks/clerk(.*)',
])

export default clerkMiddleware((auth, request) => {
  // パブリックルートでない場合は認証を要求
  if (!isPublicRoute(request)) {
    auth.protect()
  }
})

export const config = {
  // 静的ファイル、Next.js内部、favicon、ヘルスチェックAPIを除外してパフォーマンス向上
  matcher: [
    '/((?!_next|static|favicon.ico|api/health|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}