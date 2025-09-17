import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ブラウザ用クライアント作成関数
export function createClient() {
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}

// 管理者用クライアント（旧バージョン互換用）
export const supabaseAdmin = createClient()

// 廃止予定：createClientを使用してください
export const supabaseBrowser = () => {
  console.error('❌ supabaseBrowser is DEPRECATED. Use createClient() instead.')
  return createClient()
}