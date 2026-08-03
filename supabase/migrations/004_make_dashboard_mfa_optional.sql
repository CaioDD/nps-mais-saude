create or replace function private.dashboard_session_is_trusted()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and to_timestamp(coalesce(((select auth.jwt()) ->> 'iat')::bigint, 0)) >= now() - interval '8 hours';
$$;

revoke all on function private.dashboard_session_is_trusted() from public;
grant execute on function private.dashboard_session_is_trusted() to authenticated;