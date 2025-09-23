import { NextResponse } from 'next/server'

/**
 * ヘルスチェック用エンドポイント
 * ロードバランサーやモニタリングツール用
 * 認証不要でミドルウェアもスキップ
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
}