create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

alter table public.nps_responses
  add column if not exists submission_id uuid;

update public.nps_responses
set submission_id = coalesce(submission_id, gen_random_uuid()),
    submitted_at = coalesce(submitted_at, created_at, now())
where submission_id is null
   or submitted_at is null;

alter table public.nps_responses
  alter column submission_id set not null,
  alter column submission_id set default gen_random_uuid(),
  alter column submitted_at set not null,
  alter column submitted_at set default now(),
  alter column survey_branch_id set not null;

alter table public.nps_surveys
  drop constraint if exists nps_surveys_id_organization_id_key;
alter table public.nps_surveys
  add constraint nps_surveys_id_organization_id_key unique (id, organization_id);

alter table public.nps_survey_branches
  drop constraint if exists nps_survey_branches_id_organization_id_survey_id_key,
  drop constraint if exists nps_survey_branches_id_org_survey_filial_key;
alter table public.nps_survey_branches
  add constraint nps_survey_branches_id_organization_id_survey_id_key unique (id, organization_id, survey_id),
  add constraint nps_survey_branches_id_org_survey_filial_key unique (id, organization_id, survey_id, filial_slug);

alter table public.nps_responses
  drop constraint if exists nps_responses_survey_org_fkey,
  drop constraint if exists nps_responses_branch_org_survey_fkey,
  drop constraint if exists nps_responses_branch_org_survey_filial_fkey,
  drop constraint if exists nps_responses_submission_unique,
  drop constraint if exists nps_responses_text_limits,
  drop constraint if exists nps_responses_choice_values;

alter table public.nps_responses
  add constraint nps_responses_survey_org_fkey
    foreign key (survey_id, organization_id)
    references public.nps_surveys (id, organization_id)
    on delete cascade,
  add constraint nps_responses_branch_org_survey_fkey
    foreign key (survey_branch_id, organization_id, survey_id)
    references public.nps_survey_branches (id, organization_id, survey_id)
    on delete restrict,
  add constraint nps_responses_branch_org_survey_filial_fkey
    foreign key (survey_branch_id, organization_id, survey_id, filial_slug)
    references public.nps_survey_branches (id, organization_id, survey_id, filial_slug)
    on delete restrict,
  add constraint nps_responses_submission_unique unique (organization_id, survey_id, submission_id),
  add constraint nps_responses_text_limits check (
    length(filial_slug) <= 80
    and length(filial_nome) <= 120
    and length(coalesce(experiencia_geral, '')) <= 40
    and length(coalesce(atendimento_recepcao, '')) <= 40
    and length(coalesce(atendimento_coleta, '')) <= 40
    and length(coalesce(tempo_espera, '')) <= 60
    and length(coalesce(limpeza_organizacao, '')) <= 40
    and length(coalesce(prazo_entrega, '')) <= 60
    and length(coalesce(recebeu_orientacoes, '')) <= 40
    and length(coalesce(custo_beneficio, '')) <= 40
    and length(coalesce(como_conheceu, '')) <= 80
    and length(coalesce(comentarios, '')) <= 1000
  ),
  add constraint nps_responses_choice_values check (
    (experiencia_geral is null or experiencia_geral in ('Excelente', 'Boa', 'Regular', 'Ruim'))
    and (atendimento_recepcao is null or atendimento_recepcao in ('Excelente', 'Bom', 'Regular', 'Ruim'))
    and (atendimento_coleta is null or atendimento_coleta in ('Excelente', 'Bom', 'Regular', 'Ruim'))
    and (tempo_espera is null or tempo_espera in ('Muito rapido', 'Muito rápido', 'Adequado', 'Demorado', 'Muito demorado'))
    and (limpeza_organizacao is null or limpeza_organizacao in ('Excelente', 'Bom', 'Regular', 'Ruim'))
    and (prazo_entrega is null or prazo_entrega in ('Muito rapido', 'Muito rápido', 'Adequado', 'Demorado', 'Muito demorado'))
    and (recebeu_orientacoes is null or recebeu_orientacoes in ('Sim', 'Mais ou menos', 'Nao', 'Não'))
    and (custo_beneficio is null or custo_beneficio in ('Excelente', 'Bom', 'Regular', 'Ruim'))
    and (como_conheceu is null or como_conheceu in ('Indicacao', 'Indicação', 'Medico', 'Médico', 'Instagram', 'Google', 'Passando na frente', 'Outros'))
  );

create or replace function private.dashboard_session_is_trusted()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and coalesce((select auth.jwt()) ->> 'aal', '') = 'aal2'
    and to_timestamp(coalesce(((select auth.jwt()) ->> 'iat')::bigint, 0)) >= now() - interval '8 hours';
$$;

create or replace function private.user_has_organization_role(target_organization_id uuid, allowed_roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.dashboard_session_is_trusted()
    and exists (
      select 1
      from public.organization_members member
      where member.organization_id = target_organization_id
        and member.user_id = (select auth.uid())
        and (allowed_roles is null or member.role = any(allowed_roles))
    );
$$;

create or replace function public.submit_nps_response(
  p_submission_id uuid,
  p_organization_slug text,
  p_survey_slug text,
  p_filial_slug text,
  p_nps integer,
  p_experiencia_geral text default null,
  p_atendimento_recepcao text default null,
  p_atendimento_coleta text default null,
  p_tempo_espera text default null,
  p_limpeza_organizacao text default null,
  p_prazo_entrega text default null,
  p_recebeu_orientacoes text default null,
  p_custo_beneficio text default null,
  p_como_conheceu text default null,
  p_comentarios text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_organization public.organizations%rowtype;
  v_survey public.nps_surveys%rowtype;
  v_branch public.nps_survey_branches%rowtype;
  v_response_id uuid;
begin
  if p_submission_id is null then
    raise exception 'submission_id_required' using errcode = '22023';
  end if;

  if p_nps is null or p_nps < 0 or p_nps > 10 then
    raise exception 'invalid_nps' using errcode = '22023';
  end if;

  if length(coalesce(p_comentarios, '')) > 1000 then
    raise exception 'comment_too_long' using errcode = '22023';
  end if;

  select * into v_organization
  from public.organizations
  where slug = p_organization_slug
    and status = 'active'
  limit 1;

  if not found then
    raise exception 'organization_not_found' using errcode = '22023';
  end if;

  select * into v_survey
  from public.nps_surveys
  where organization_id = v_organization.id
    and slug = p_survey_slug
    and status = 'active'
  limit 1;

  if not found then
    raise exception 'survey_not_found' using errcode = '22023';
  end if;

  select * into v_branch
  from public.nps_survey_branches
  where organization_id = v_organization.id
    and survey_id = v_survey.id
    and filial_slug = p_filial_slug
    and active is true
  limit 1;

  if not found then
    raise exception 'branch_not_found' using errcode = '22023';
  end if;

  insert into public.nps_responses (
    submission_id,
    organization_id,
    survey_id,
    survey_branch_id,
    submitted_at,
    filial_slug,
    filial_nome,
    nps,
    experiencia_geral,
    atendimento_recepcao,
    atendimento_coleta,
    tempo_espera,
    limpeza_organizacao,
    prazo_entrega,
    recebeu_orientacoes,
    custo_beneficio,
    como_conheceu,
    comentarios
  ) values (
    p_submission_id,
    v_organization.id,
    v_survey.id,
    v_branch.id,
    now(),
    v_branch.filial_slug,
    v_branch.filial_nome,
    p_nps,
    nullif(p_experiencia_geral, ''),
    nullif(p_atendimento_recepcao, ''),
    nullif(p_atendimento_coleta, ''),
    nullif(p_tempo_espera, ''),
    nullif(p_limpeza_organizacao, ''),
    nullif(p_prazo_entrega, ''),
    nullif(p_recebeu_orientacoes, ''),
    nullif(p_custo_beneficio, ''),
    nullif(p_como_conheceu, ''),
    nullif(p_comentarios, '')
  )
  on conflict (organization_id, survey_id, submission_id) do update
  set submission_id = excluded.submission_id
  returning id into v_response_id;

  return v_response_id;
end;
$$;

revoke all on function private.dashboard_session_is_trusted() from public;
revoke all on function private.user_has_organization_role(uuid, text[]) from public;
revoke all on function public.submit_nps_response(uuid, text, text, text, integer, text, text, text, text, text, text, text, text, text, text) from public;
revoke all on function public.submit_nps_response(uuid, text, text, text, integer, text, text, text, text, text, text, text, text, text, text) from anon;
revoke all on function public.submit_nps_response(uuid, text, text, text, integer, text, text, text, text, text, text, text, text, text, text) from authenticated;
grant execute on function private.user_has_organization_role(uuid, text[]) to authenticated;
grant execute on function public.submit_nps_response(uuid, text, text, text, integer, text, text, text, text, text, text, text, text, text, text) to service_role;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.nps_surveys enable row level security;
alter table public.nps_survey_branches enable row level security;
alter table public.nps_responses enable row level security;

revoke all on table public.organizations from anon, authenticated, service_role;
revoke all on table public.organization_members from anon, authenticated, service_role;
revoke all on table public.nps_surveys from anon, authenticated, service_role;
revoke all on table public.nps_survey_branches from anon, authenticated, service_role;
revoke all on table public.nps_responses from anon, authenticated, service_role;

grant select on table public.organizations to authenticated;
grant select on table public.organization_members to authenticated;
grant select on table public.nps_surveys to authenticated;
grant select on table public.nps_survey_branches to authenticated;
grant select on table public.nps_responses to authenticated;

drop policy if exists "Members can view their organizations" on public.organizations;
create policy "Members can view their organizations"
  on public.organizations
  for select
  to authenticated
  using (private.user_has_organization_role(id));

drop policy if exists "Users can view their own memberships" on public.organization_members;
create policy "Users can view their own memberships"
  on public.organization_members
  for select
  to authenticated
  using (
    private.dashboard_session_is_trusted()
    and (select auth.uid()) = user_id
  );

drop policy if exists "Organization admins can create memberships" on public.organization_members;
drop policy if exists "Organization admins can update memberships" on public.organization_members;

drop policy if exists "Members can view organization surveys" on public.nps_surveys;
create policy "Members can view organization surveys"
  on public.nps_surveys
  for select
  to authenticated
  using (private.user_has_organization_role(organization_id));

drop policy if exists "Organization admins can manage surveys" on public.nps_surveys;
drop policy if exists "Organization admins can insert surveys" on public.nps_surveys;
drop policy if exists "Organization admins can update surveys" on public.nps_surveys;

drop policy if exists "Members can view survey branches" on public.nps_survey_branches;
create policy "Members can view survey branches"
  on public.nps_survey_branches
  for select
  to authenticated
  using (private.user_has_organization_role(organization_id));

drop policy if exists "Organization admins can manage survey branches" on public.nps_survey_branches;
drop policy if exists "Organization admins can insert survey branches" on public.nps_survey_branches;
drop policy if exists "Organization admins can update survey branches" on public.nps_survey_branches;

drop policy if exists "Equipe autenticada pode ver respostas NPS" on public.nps_responses;
drop policy if exists "Members can view organization responses" on public.nps_responses;
create policy "Members can view organization responses"
  on public.nps_responses
  for select
  to authenticated
  using (private.user_has_organization_role(organization_id));

drop policy if exists "Organization admins can update responses" on public.nps_responses;

alter default privileges in schema public revoke all on tables from anon, authenticated, service_role;
alter default privileges in schema public revoke all on functions from public, anon, authenticated;

create index if not exists nps_responses_submission_id_idx
  on public.nps_responses (organization_id, survey_id, submission_id);

create index if not exists nps_responses_submitted_at_idx
  on public.nps_responses (organization_id, submitted_at desc);

do $$
begin
  begin
    create extension if not exists pg_cron;
  exception
    when insufficient_privilege or undefined_file then
      raise notice 'pg_cron unavailable; configure comment redaction job manually';
  end;

  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid)
    from cron.job
    where jobname = 'redact_nps_comments_24_months';

    perform cron.schedule(
      'redact_nps_comments_24_months',
      '15 3 * * *',
      $cron$
        update public.nps_responses
        set comentarios = null
        where comentarios is not null
          and submitted_at < now() - interval '24 months';
      $cron$
    );
  end if;
end;
$$;

