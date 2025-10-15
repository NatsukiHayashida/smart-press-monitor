import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClerkClient } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  // Webhook secretを取得
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('❌ CLERK_WEBHOOK_SECRET環境変数が設定されていません')
    return new Response('Error: CLERK_WEBHOOK_SECRET not configured', {
      status: 500,
    })
  }

  console.log('✅ CLERK_WEBHOOK_SECRET is configured')

  // ヘッダーを取得
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // ヘッダーが存在しない場合はエラー
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', {
      status: 400,
    })
  }

  // リクエストボディを取得
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Svix webhookインスタンスを作成
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Webhookを検証
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook検証エラー:', err)
    return new Response('Error: Webhook verification failed', {
      status: 400,
    })
  }

  // イベントタイプを取得
  const eventType = evt.type
  console.log(`📩 Webhook received: ${eventType}`)

  // user.createdイベントを処理
  if (eventType === 'user.created') {
    const { id, email_addresses } = evt.data
    console.log(`👤 Processing user: ${id}`)

    // プライマリメールアドレスを取得
    const primaryEmail = email_addresses.find((email) => email.id === evt.data.primary_email_address_id)

    if (!primaryEmail) {
      console.error('プライマリメールアドレスが見つかりません')
      return new Response('Error: No primary email found', { status: 400 })
    }

    const emailAddress = primaryEmail.email_address
    const allowedDomain = '@iidzka.co.jp'
    const exceptionEmail = 'ibron1975@gmail.com'

    console.log(`📧 Email: ${emailAddress}`)

    // ドメインチェック
    const isAllowedDomain = emailAddress.endsWith(allowedDomain)
    const isException = emailAddress === exceptionEmail

    console.log(`🔍 Domain check: allowed=${isAllowedDomain}, exception=${isException}`)

    if (!isAllowedDomain && !isException) {
      console.log(`🚫 許可されていないドメイン: ${emailAddress}`)

      try {
        // CLERK_SECRET_KEYを確認
        const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY

        if (!CLERK_SECRET_KEY) {
          console.error('❌ CLERK_SECRET_KEY環境変数が設定されていません')
          throw new Error('CLERK_SECRET_KEY is not configured')
        }

        console.log('✅ CLERK_SECRET_KEY is configured')

        // Clerk clientを明示的に作成
        const client = createClerkClient({ secretKey: CLERK_SECRET_KEY })
        console.log('✅ Clerk client created successfully')

        // ユーザーを削除
        await client.users.deleteUser(id)
        console.log(`✅ ユーザーを削除しました: ${emailAddress}`)

        return new Response(
          JSON.stringify({
            message: 'User deleted: Email domain not allowed',
            email: emailAddress
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      } catch (error) {
        console.error('❌ ユーザー削除エラー:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        return new Response(
          JSON.stringify({
            error: 'Failed to delete user',
            details: error instanceof Error ? error.message : 'Unknown error'
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    console.log(`✅ 許可されたドメイン: ${emailAddress}`)
  }

  return new Response('Webhook processed', { status: 200 })
}
