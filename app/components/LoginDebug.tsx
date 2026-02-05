'use client'

import { createClient } from '@/utils/supabase/client'

export default function LoginDebug() {
  const handleLogin = async () => {
    const supabase = createClient()
    console.log('Starting client-side login...')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'x',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    console.log('SignIn Result:', { data, error })
  }

  return (
    <button 
      onClick={handleLogin}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4"
    >
      Debug: Client-Side Login
    </button>
  )
}
