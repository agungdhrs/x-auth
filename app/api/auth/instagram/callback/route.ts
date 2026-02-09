import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    console.error('Instagram OAuth error:', error)
    return NextResponse.redirect(`${origin}?error=instagram_auth_failed`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}?error=missing_params`)
  }

  // Verify state from cookie
  const cookieStore = await cookies()
  const savedState = cookieStore.get('instagram_oauth_state')?.value
  
  if (state !== savedState) {
    console.error('State mismatch:', { state, savedState })
    return NextResponse.redirect(`${origin}?error=state_mismatch`)
  }
  
  // Clear the state cookie
  cookieStore.delete('instagram_oauth_state')

  const supabase = await createClient()

  try {
    // Step 1: Exchange code for access token (Instagram API)
    const tokenResponse = await exchangeCodeForToken(code)
    console.log('=== Token Response ===', tokenResponse)

    if (!tokenResponse.access_token) {
      console.error('No access token received:', tokenResponse)
      return NextResponse.redirect(`${origin}?error=no_access_token`)
    }

    // Step 2: Get Instagram user info
    const instagramData = await getInstagramUserInfo(tokenResponse.access_token)
    console.log('=== Instagram Data ===', instagramData)

    if (!instagramData) {
      return NextResponse.redirect(`${origin}?error=no_instagram_data`)
    }

    // Step 3: Check if user exists with this Instagram account
    const { data: existingAccount } = await supabase
      .from('instagram_accounts')
      .select('user_id')
      .eq('instagram_user_id', instagramData.id)
      .single()

    let userId: string

    if (existingAccount) {
      // User already exists
      userId = existingAccount.user_id
      console.log('Existing user found:', userId)
    } else {
      // Check if currently logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Link to existing user
        userId = user.id
      } else {
        // Create a new user
        const randomEmail = `instagram_${instagramData.id}@instagram.placeholder`
        const randomPassword = crypto.randomUUID()
        
        const { data: newUser, error: signUpError } = await supabase.auth.signUp({
          email: randomEmail,
          password: randomPassword,
          options: {
            data: {
              provider: 'instagram',
              instagram_username: instagramData.username,
              full_name: instagramData.name,
            }
          }
        })

        if (signUpError || !newUser.user) {
          console.error('Failed to create user:', signUpError)
          return NextResponse.redirect(`${origin}?error=user_creation_failed`)
        }

        userId = newUser.user.id
        console.log('New user created:', userId)
      }
    }

    // Step 4: Save/update Instagram account data
    const { error: dbError } = await supabase
      .from('instagram_accounts')
      .upsert({
        user_id: userId,
        instagram_user_id: instagramData.id,
        instagram_business_id: instagramData.id, // Same as user_id for business accounts
        username: instagramData.username,
        full_name: instagramData.name,
        avatar_url: instagramData.profile_picture_url,
        access_token: tokenResponse.access_token,
        token_expires_at: tokenResponse.expires_in 
          ? new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id, instagram_user_id'
      })

    if (dbError) {
      console.error('❌ Failed to save Instagram account:', dbError)
      return NextResponse.redirect(`${origin}?error=db_error`)
    }

    console.log('✅ Successfully saved Instagram account to database')
    return NextResponse.redirect(origin)

  } catch (err) {
    console.error('Instagram callback error:', err)
    return NextResponse.redirect(`${origin}?error=callback_failed`)
  }
}

async function exchangeCodeForToken(code: string) {
  const appId = process.env.INSTAGRAM_APP_ID
  const appSecret = process.env.INSTAGRAM_APP_SECRET
  const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/instagram/callback`

  // Instagram token exchange endpoint
  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: appId!,
      client_secret: appSecret!,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code: code,
    }),
  })

  const data = await response.json()

  if (data.error_type) {
    throw new Error(data.error_message || data.error_type)
  }

  return data
}

async function getInstagramUserInfo(accessToken: string) {
  // Get user info from Instagram Graph API
  const userUrl = `https://graph.instagram.com/me?fields=id,username,name,profile_picture_url,account_type&access_token=${accessToken}`
  
  const response = await fetch(userUrl)
  const data = await response.json()

  console.log('Instagram user info:', data)

  if (data.error) {
    console.error('Failed to get user info:', data.error)
    return null
  }

  return data
}
