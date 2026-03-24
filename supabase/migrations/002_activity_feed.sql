-- Create the new calendar_activity table
create table public.calendar_activity (
  id uuid primary key default gen_random_uuid(),
  calendar_id uuid not null references public.calendars(id) on delete cascade,
  action text not null check (action in ('added', 'updated', 'deleted')),
  event_title text not null,
  actor_name text not null,
  created_at timestamptz not null default now()
);

create index calendar_activity_calendar_id_idx on public.calendar_activity(calendar_id);

-- Enable RLS
alter table public.calendar_activity enable row level security;

-- Policy: anyone with a session for this calendar can view its activity
create policy "activity_select_own_session"
  on public.calendar_activity for select
  using (
    exists (
      select 1 from public.calendar_sessions s
      where s.calendar_id = calendar_activity.calendar_id
        and s.token = public.jwt_session_token()
    )
  );

-- Trigger function to log event changes automatically
create or replace function public.log_calendar_activity()
returns trigger
language plpgsql
security definer
as $$
declare
  v_action text;
  v_title text;
  v_actor text;
  v_cal_id uuid;
begin
  if TG_OP = 'INSERT' then
    v_action := 'added';
    v_title := NEW.title;
    v_actor := NEW.creator_name;
    v_cal_id := NEW.calendar_id;
  elsif TG_OP = 'UPDATE' then
    v_action := 'updated';
    v_title := NEW.title;
    v_actor := NEW.creator_name;
    v_cal_id := NEW.calendar_id;
  elsif TG_OP = 'DELETE' then
    v_action := 'deleted';
    v_title := OLD.title;
    v_actor := OLD.creator_name;
    v_cal_id := OLD.calendar_id;
  end if;

  insert into public.calendar_activity (calendar_id, action, event_title, actor_name)
  values (v_cal_id, v_action, v_title, v_actor);

  if TG_OP = 'DELETE' then
    return OLD;
  end if;
  return NEW;
end;
$$;

-- Attach trigger to events table
create trigger on_event_change
  after insert or update or delete on public.events
  for each row execute function public.log_calendar_activity();

-- Enable Realtime for the new table
do $$
begin
  alter publication supabase_realtime add table public.calendar_activity;
exception
  when duplicate_object then null;
end $$;
