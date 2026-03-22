-- Group calendar: code-based access + RLS + Realtime
-- Fresh consolidated initial schema with owner codes included from the start

create extension if not exists pgcrypto;

-- Alphanumeric without ambiguous chars (Crockford-ish)
create or replace function public.random_code_segment(len int)
returns text
language plpgsql
as $$
declare
  alphabet text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  out text := '';
  i int;
begin
  for i in 1..len loop
    out := out || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return out;
end;
$$;

create or replace function public.hash_access_code(code text)
returns text
language sql
immutable
as $$
  select encode(sha256(convert_to(lower(trim(code)), 'UTF8')), 'hex');
$$;

create table public.calendars (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  name text not null,
  write_code_hash text not null,
  read_code_hash text not null,
  write_code_plain text not null,
  read_code_plain text not null,
  owner_code_hash text not null,
  owner_code_plain text not null,
  created_at timestamptz not null default now()
);

create unique index calendars_owner_code_plain_idx on public.calendars(owner_code_plain);
create unique index calendars_owner_code_hash_idx on public.calendars(owner_code_hash);

create table public.calendar_sessions (
  id uuid primary key default gen_random_uuid(),
  calendar_id uuid not null references public.calendars(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  access_level text not null check (access_level in ('owner', 'write', 'read')),
  created_at timestamptz not null default now()
);

create index calendar_sessions_calendar_id_idx on public.calendar_sessions(calendar_id);
create index calendar_sessions_token_idx on public.calendar_sessions(token);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  calendar_id uuid not null references public.calendars(id) on delete cascade,
  title text not null,
  event_date date not null,
  start_time time not null,
  end_time time,
  note text,
  creator_name text not null default 'Anonymous',
  created_at timestamptz not null default now()
);

create index events_calendar_id_idx on public.events(calendar_id);
create index events_calendar_date_idx on public.events(calendar_id, event_date);

alter table public.calendars enable row level security;
alter table public.calendar_sessions enable row level security;
alter table public.events enable row level security;

-- JWT must include claim session_token (uuid string) signed with project JWT secret (see Vercel /api/auth/session)

create or replace function public.jwt_session_token()
returns uuid
language sql
stable
as $$
  select nullif(trim(auth.jwt() ->> 'session_token'), '')::uuid;
$$;

create policy "calendars_select_own_session"
  on public.calendars for select
  using (
    exists (
      select 1 from public.calendar_sessions s
      where s.calendar_id = calendars.id
        and s.token = public.jwt_session_token()
    )
  );

create policy "calendars_delete_owner"
  on public.calendars for delete
  using (
    exists (
      select 1 from public.calendar_sessions s
      where s.calendar_id = calendars.id
        and s.token = public.jwt_session_token()
        and s.access_level = 'owner'
    )
  );

create policy "sessions_select_own"
  on public.calendar_sessions for select
  using (token = public.jwt_session_token());

create policy "events_select_own_session"
  on public.events for select
  using (
    exists (
      select 1 from public.calendar_sessions s
      where s.calendar_id = events.calendar_id
        and s.token = public.jwt_session_token()
    )
  );

create policy "events_insert_write"
  on public.events for insert
  with check (
    exists (
      select 1 from public.calendar_sessions s
      where s.calendar_id = events.calendar_id
        and s.token = public.jwt_session_token()
        and s.access_level in ('owner', 'write')
    )
  );

create policy "events_delete_write_owner"
  on public.events for delete
  using (
    exists (
      select 1 from public.calendar_sessions s
      where s.calendar_id = events.calendar_id
        and s.token = public.jwt_session_token()
        and s.access_level in ('owner', 'write')
    )
  );

-- RPCs (anon can call; logic is SECURITY DEFINER)

create or replace function public.create_calendar(p_name text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_public_id text;
  v_write text;
  v_read text;
  v_owner text;
  v_cal_id uuid;
  v_created_at timestamptz;
  v_owner_token uuid;
begin
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'Name required';
  end if;

  v_public_id := public.random_code_segment(6);
  v_write := 'WR-' || public.random_code_segment(6);
  v_read := 'RD-' || public.random_code_segment(6);
  v_owner := 'OW-' || public.random_code_segment(6);

  insert into public.calendars (
    public_id,
    name,
    write_code_hash,
    read_code_hash,
    write_code_plain,
    read_code_plain,
    owner_code_hash,
    owner_code_plain
  )
  values (
    v_public_id,
    trim(p_name),
    public.hash_access_code(v_write),
    public.hash_access_code(v_read),
    v_write,
    v_read,
    public.hash_access_code(v_owner),
    v_owner
  )
  returning id, created_at into v_cal_id, v_created_at;

  insert into public.calendar_sessions (calendar_id, access_level, token)
  values (v_cal_id, 'owner', gen_random_uuid())
  returning token into v_owner_token;

  return jsonb_build_object(
    'calendar_id', v_cal_id,
    'public_id', v_public_id,
    'write_code', v_write,
    'read_code', v_read,
    'owner_code', v_owner,
    'owner_session_token', v_owner_token::text,
    'created_at', v_created_at
  );
end;
$$;

grant execute on function public.create_calendar(text) to anon, authenticated;

create or replace function public.join_calendar(p_public_id text, p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cal public.calendars%rowtype;
  v_norm text;
  v_hash text;
  v_level text;
  v_token uuid;
begin
  if p_public_id is null or length(trim(p_public_id)) = 0 then
    raise exception 'Calendar not found';
  end if;
  if p_code is null or length(trim(p_code)) = 0 then
    raise exception 'Code required';
  end if;

  select * into v_cal from public.calendars c where c.public_id = trim(p_public_id);
  if not found then
    raise exception 'Calendar not found';
  end if;

  v_norm := trim(p_code);
  v_hash := public.hash_access_code(v_norm);

  if v_hash = v_cal.owner_code_hash then
    v_level := 'owner';
  elsif v_hash = v_cal.write_code_hash then
    v_level := 'write';
  elsif v_hash = v_cal.read_code_hash then
    v_level := 'read';
  else
    raise exception 'Invalid code';
  end if;

  insert into public.calendar_sessions (calendar_id, access_level, token)
  values (v_cal.id, v_level, gen_random_uuid())
  returning token into v_token;

  return jsonb_build_object(
    'calendar_id', v_cal.id,
    'public_id', v_cal.public_id,
    'access_level', v_level,
    'session_token', v_token::text
  );
end;
$$;

grant execute on function public.join_calendar(text, text) to anon, authenticated;

create or replace function public.get_calendar_meta(p_public_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v public.calendars%rowtype;
begin
  if p_public_id is null or length(trim(p_public_id)) = 0 then
    return jsonb_build_object('found', false);
  end if;

  select * into v from public.calendars c where c.public_id = trim(p_public_id);
  if not found then
    return jsonb_build_object('found', false);
  end if;

  return jsonb_build_object(
    'found', true,
    'name', v.name,
    'public_id', v.public_id
  );
end;
$$;

grant execute on function public.get_calendar_meta(text) to anon, authenticated;

create or replace function public.regenerate_codes(p_session_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sess public.calendar_sessions%rowtype;
  v_write text;
  v_read text;
begin
  if p_session_token is null then
    raise exception 'Not allowed';
  end if;

  select * into v_sess from public.calendar_sessions s where s.token = p_session_token;
  if not found then
    raise exception 'Not allowed';
  end if;
  if v_sess.access_level <> 'owner' then
    raise exception 'Not allowed';
  end if;

  v_write := 'WR-' || public.random_code_segment(6);
  v_read := 'RD-' || public.random_code_segment(6);

  update public.calendars c
  set write_code_hash = public.hash_access_code(v_write),
      read_code_hash = public.hash_access_code(v_read),
      write_code_plain = v_write,
      read_code_plain = v_read,
      owner_code_hash = c.owner_code_hash,
      owner_code_plain = c.owner_code_plain
  where c.id = v_sess.calendar_id;

  return jsonb_build_object(
    'write_code', v_write,
    'read_code', v_read
  );
end;
$$;

grant execute on function public.regenerate_codes(uuid) to anon, authenticated;

create or replace function public.get_calendar_codes(p_session_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sess public.calendar_sessions%rowtype;
  v_write text;
  v_read text;
  v_owner text;
begin
  if p_session_token is null then
    raise exception 'Not allowed';
  end if;

  select * into v_sess from public.calendar_sessions s where s.token = p_session_token;
  if not found or v_sess.access_level <> 'owner' then
    raise exception 'Not allowed';
  end if;

  select c.write_code_plain, c.read_code_plain, c.owner_code_plain into v_write, v_read, v_owner
  from public.calendars c
  where c.id = v_sess.calendar_id;

  return jsonb_build_object(
    'write_code', v_write,
    'read_code', v_read,
    'owner_code', v_owner
  );
end;
$$;

grant execute on function public.get_calendar_codes(uuid) to anon, authenticated;

-- Realtime: include events (ignore if already added)
do $$
begin
  alter publication supabase_realtime add table public.events;
exception
  when duplicate_object then null;
end $$;

