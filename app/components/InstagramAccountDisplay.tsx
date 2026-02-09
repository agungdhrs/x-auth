import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'

export default async function InstagramAccountDisplay({ userId }: { userId: string }) {
  const supabase = await createClient()
  
  const { data: accounts, error } = await supabase
    .from('instagram_accounts')
    .select('*')
    .eq('user_id', userId)
  
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 text-red-400 p-4 rounded-lg">
        <p className="font-semibold">Error loading Instagram accounts:</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    )
  }
  
  if (!accounts || accounts.length === 0) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-700 text-yellow-400 p-4 rounded-lg">
        <p>No Instagram accounts connected yet.</p>
      </div>
    )
  }
  
  return (
    <div className="w-full max-w-2xl">
      <h3 className="text-xl font-bold mb-4">Instagram Account</h3>
      {accounts.map((account) => (
        <div key={account.id} className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-pink-700 p-4 rounded-lg">
          <div className="flex items-center gap-4 mb-4">
            {account.avatar_url && (
              <Image
                src={account.avatar_url}
                alt={account.username}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full"
                unoptimized
              />
            )}
            <div>
              <p className="font-semibold text-lg">{account.full_name || account.username}</p>
              <p className="text-pink-400">@{account.username}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">Instagram Business ID:</span>
              <p className="font-mono text-xs text-pink-400 break-all">
                {account.instagram_business_id}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Instagram User ID:</span>
              <p className="font-mono text-xs text-pink-400 break-all">
                {account.instagram_user_id}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Access Token:</span>
              <p className="font-mono text-xs text-green-400 break-all">
                {account.access_token?.substring(0, 40)}...
              </p>
            </div>
            {account.token_expires_at && (
              <div className="text-gray-400 text-xs mt-2">
                Token expires: {new Date(account.token_expires_at).toLocaleString()}
              </div>
            )}
            <div className="text-gray-400 text-xs">
              Updated: {new Date(account.updated_at).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
