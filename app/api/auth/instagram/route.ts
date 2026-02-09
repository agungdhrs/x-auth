import { NextResponse } from 'next/server'

export async function GET() {
  const appId = process.env.INSTAGRAM_APP_ID
  // Redirect to n8n webhook which will handle the callback
  const redirectUri = 'https://irisnco.app.n8n.cloud/webhook/instagram-callback'
  
  // Scopes for Instagram Business API
  const scopes = [
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments',
    'instagram_business_content_publish',
    'instagram_business_manage_insights'
  ].join(',')
  
  // Instagram OAuth URL
  const authUrl = new URL('https://www.instagram.com/oauth/authorize')
  authUrl.searchParams.set('client_id', appId!)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', scopes)
  authUrl.searchParams.set('response_type', 'code')

  return NextResponse.redirect(authUrl.toString())
}
