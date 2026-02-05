-- Add secret_token column if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'twitter_accounts' and column_name = 'secret_token') then
    alter table public.twitter_accounts add column secret_token text;
  end if;
end $$;
