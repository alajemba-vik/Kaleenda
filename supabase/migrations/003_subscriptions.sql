-- Create the subscriptions table
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  calendar_id uuid not null references public.calendars(id) on delete cascade,
  email text not null,
  notify_on_new boolean not null default false,
  remind_minutes_before integer, -- null means no reminder, e.g. 5, 30, 1440 (1 day)
  created_at timestamptz not null default now(),
  unique(calendar_id, email)
);

create index subscriptions_calendar_id_idx on public.subscriptions(calendar_id);
create index subscriptions_email_idx on public.subscriptions(email);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- Policy: anyone can insert a subscription for a calendar they have a session for
create policy "subscriptions_insert_with_session"
  on public.subscriptions for insert
  with check (
    exists (
      select 1 from public.calendar_sessions s
      where s.calendar_id = subscriptions.calendar_id
        and s.token = public.jwt_session_token()
    )
  );

-- Policy: anyone can view their own subscription if they know the email
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (
    exists (
      select 1 from public.calendar_sessions s
      where s.calendar_id = subscriptions.calendar_id
        and s.token = public.jwt_session_token()
    )
  );

-- Webhook to trigger Edge Function when new events are added
-- NOTE: In a real Supabase project, you would create this trigger via the Dashboard (Database -> Webhooks)
-- Here is the raw sql for reference, it relies on net.http_post which requires pg_net extension
-- 
-- create extension if not exists pg_net;
-- 
-- create or replace function public.notify_subscribers_on_new_event()
-- returns trigger
-- language plpgsql
-- security definer
-- as $$
-- begin
--   perform net.http_post(
--     url := 'https://bptzbtgjurwtkhnwjurz.supabase.co/functions/v1/email-subscribers',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
--     body := jsonb_build_object('record', row_to_json(NEW))
--   );
--   return NEW;
-- end;
-- $$;
-- 
-- create trigger on_event_insert_notify
--   after insert on public.events
--   for each row execute function public.notify_subscribers_on_new_event();
