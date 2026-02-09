-- Create a table to store Instagram Business accounts linked to users
create table if not exists public.instagram_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  instagram_user_id text not null, -- Instagram user ID
  instagram_business_id text, -- Instagram Business Account ID
  page_id text, -- Facebook Page ID linked to Instagram
  username text,
  full_name text,
  avatar_url text,
  access_token text not null,
  token_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Ensure one instagram account per user
  unique(user_id, instagram_user_id)
);

-- Enable RLS
alter table public.instagram_accounts enable row level security;

-- Allow users to view their own linked accounts
create policy "Users can view their own instagram accounts"
  on public.instagram_accounts for select
  using ( auth.uid() = user_id );

-- Allow users to insert their own accounts
create policy "Users can insert their own instagram accounts"
  on public.instagram_accounts for insert
  with check ( auth.uid() = user_id );

-- Allow users to update their own accounts
create policy "Users can update their own instagram accounts"
  on public.instagram_accounts for update
  using ( auth.uid() = user_id );
