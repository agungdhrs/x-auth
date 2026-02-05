import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LoginDebug from './components/LoginDebug'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const signOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  const signInWithX = async () => {
    'use server'
    const supabase = await createClient()
    // Helper to determine the URL
    // In production you should set NEXT_PUBLIC_BASE_URL
    const getURL = () => {
      let url =
        process.env.NEXT_PUBLIC_BASE_URL ?? // Set this to your site URL in production env.
        process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
        'http://localhost:3000/'
      // Make sure to include `https://` when not localhost.
      url = url.includes('http') ? url : `https://${url}`
      // Make sure to include a trailing `/`.
      url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
      return url
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'x', // 'x' seems to contain the correct v2 configuration!
      options: {
        redirectTo: `${getURL()}auth/callback`,
      },
    })

    if (error) {
      console.error('OAuth error:', error)
    }

    if (data.url) {
      redirect(data.url)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50 text-black dark:text-white dark:bg-gray-900">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-8">
          Supabase + Next.js X Auth
        </h1>

        <div className="mt-8">
          {user ? (
            <div className="flex flex-col gap-4 items-center">
              <p className="text-lg">Logged in as: <span className="font-semibold">{user.email}</span></p>
              <div className="text-left bg-gray-800 text-green-400 p-4 rounded-lg max-w-2xl overflow-auto border border-gray-700 shadow-lg">
                <pre className="text-xs">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
              <form action={signOut}>
                <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition duration-300">
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <>
              <form action={signInWithX}>
                <button className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-full flex items-center gap-3 shadow-lg transition duration-300 border border-gray-700">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                   </svg>
                   Sign in with X
                </button>
              </form>
              <LoginDebug />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
