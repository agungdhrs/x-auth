import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LoginDebug from './components/LoginDebug'
import TwitterAccountDisplay from './components/TwitterAccountDisplay'
import InstagramAccountDisplay from './components/InstagramAccountDisplay'

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
        scopes: 'tweet.read tweet.write users.read offline.access',
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
          Supabase + Next.js Social Auth
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
              
              {/* Social Accounts */}
              <div className="flex flex-col gap-4 w-full max-w-2xl">
                <TwitterAccountDisplay userId={user.id} />
                <InstagramAccountDisplay userId={user.id} />
              </div>
              
              {/* Connect Instagram Button */}
              <a 
                href="/api/auth/instagram"
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-full flex items-center gap-3 shadow-lg transition duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Connect Instagram
              </a>
              
              <form action={signOut}>
                <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition duration-300">
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center">
              <form action={signInWithX}>
                <button className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-full flex items-center gap-3 shadow-lg transition duration-300 border border-gray-700">
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                   </svg>
                   Sign in with X
                </button>
              </form>
              
              <a 
                href="/api/auth/instagram"
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-full flex items-center gap-3 shadow-lg transition duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Sign in with Instagram
              </a>
              
              <LoginDebug />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
