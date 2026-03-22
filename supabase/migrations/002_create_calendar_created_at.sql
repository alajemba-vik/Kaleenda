-- Return authoritative DB timestamp from create_calendar

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

