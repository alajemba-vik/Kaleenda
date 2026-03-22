-- Plushie moods and calendar themes

alter table public.events
  add column if not exists mood text default 'chill';

update public.events
set mood = coalesce(nullif(trim(mood), ''), 'chill')
where mood is null or length(trim(mood)) = 0;

alter table public.events
  alter column mood set default 'chill',
  alter column mood set not null;

alter table public.calendars
  add column if not exists theme text default 'default';

update public.calendars
set theme = coalesce(nullif(trim(theme), ''), 'default')
where theme is null or length(trim(theme)) = 0;

alter table public.calendars
  alter column theme set default 'default',
  alter column theme set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'events_mood_check'
  ) then
    alter table public.events add constraint events_mood_check check (
      mood in ('chill','panic','celebration','onfire','deadline','easy','urgent','vibes','love','hyperspeed','melting','glitch','hype','ghost','zen','chaos')
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'calendars_theme_check'
  ) then
    alter table public.calendars add constraint calendars_theme_check check (
      theme in ('default','dark','pastel','forest','midnight','sunset')
    );
  end if;
end $$;

drop policy if exists "calendars_update_theme_write" on public.calendars;
create policy "calendars_update_theme_write"
  on public.calendars for update
  using (
    exists (
      select 1 from public.calendar_sessions s
      where s.calendar_id = calendars.id
        and s.token = public.jwt_session_token()
        and s.access_level in ('owner', 'write')
    )
  )
  with check (
    exists (
      select 1 from public.calendar_sessions s
      where s.calendar_id = calendars.id
        and s.token = public.jwt_session_token()
        and s.access_level in ('owner', 'write')
    )
  );

do $$
begin
  alter publication supabase_realtime add table public.calendars;
exception
  when duplicate_object then null;
end $$;

