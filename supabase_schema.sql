-- Create a table to store Twitter accounts linked to users
create table if not exists public.twitter_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  provider_id text not null, -- The Twitter user ID
  username text,
  full_name text,
  avatar_url text,
  access_token text not null,
  refresh_token text, -- Twitter OAuth 2.0 might return this
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Ensure one twitter account per user (optional, or one specific twitter account per DB row)
  unique(user_id, provider_id)
);

-- Enable RLS
alter table public.twitter_accounts enable row level security;

-- Allow users to view their own linked accounts
create policy "Users can view their own twitter accounts"
  on public.twitter_accounts for select
  using ( auth.uid() = user_id );

-- Allow users to insert/update their own accounts (mostly handled server-side, but good for security)
create policy "Users can insert their own twitter accounts"
  on public.twitter_accounts for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own twitter accounts"
  on public.twitter_accounts for update
  using ( auth.uid() = user_id );
