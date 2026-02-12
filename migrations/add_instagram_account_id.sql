-- Migration: Add instagram_account_id column for webhook-compatible Instagram Business Account ID

-- Add the new column
ALTER TABLE public.instagram_accounts 
ADD COLUMN IF NOT EXISTS instagram_account_id text;

-- Add comment for clarity
COMMENT ON COLUMN public.instagram_accounts.instagram_account_id IS 
'Instagram Business Account ID in 17841... format, used for Instagram Webhooks API';

COMMENT ON COLUMN public.instagram_accounts.instagram_business_id IS 
'Legacy Instagram Business Account ID (app-scoped user_id)';
