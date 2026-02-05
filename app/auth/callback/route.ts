import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!session) {
      if (error) {
        console.error('Exchange code error:', error)
      }
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    // Extract tokens and user info
    const { provider_token, provider_refresh_token, user } = session
    const { user_metadata } = user

    if (provider_token && user_metadata) {
      // Save to twitter_accounts table
      const { error: dbError } = await supabase
        .from('twitter_accounts')
        .upsert({
          user_id: user.id,
          provider_id: user_metadata.provider_id,
          username: user_metadata.preferred_username,
          full_name: user_metadata.full_name,
          avatar_url: user_metadata.avatar_url,
          access_token: provider_token,
          // secret_token is NOT used in OAuth 2.0
          refresh_token: provider_refresh_token, 
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id, provider_id'
        })
      
      if (dbError) {
        console.error('Failed to save Twitter token:', dbError)
      }
    }

    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    
    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
