create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner', 'admin', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.nps_surveys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  slug text not null,
  title text not null,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.nps_survey_branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  survey_id uuid not null references public.nps_surveys(id) on delete cascade,
  filial_slug text not null,
  filial_nome text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, survey_id, filial_slug)
);

create table if not exists public.nps_responses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  survey_id uuid references public.nps_surveys(id) on delete cascade,
  survey_branch_id uuid references public.nps_survey_branches(id) on delete set null,
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  filial_slug text not null,
  filial_nome text not null,
  nps integer not null check (nps between 0 and 10),
  experiencia_geral text,
  atendimento_recepcao text,
  atendimento_coleta text,
  tempo_espera text,
  limpeza_organizacao text,
  prazo_entrega text,
  recebeu_orientacoes text,
  custo_beneficio text,
  como_conheceu text,
  comentarios text
);

alter table public.nps_responses
  add column if not exists organization_id uuid references public.organizations(id) on delete cascade,
  add column if not exists survey_id uuid references public.nps_surveys(id) on delete cascade,
  add column if not exists survey_branch_id uuid references public.nps_survey_branches(id) on delete set null;

insert into public.organizations (slug, name, status)
values ('mais-saude', 'Mais Saude', 'active')
on conflict (slug) do update set
  name = excluded.name,
  status = excluded.status,
  updated_at = now();

insert into public.nps_surveys (organization_id, slug, title, status)
select id, 'atendimento', 'Pesquisa de atendimento', 'active'
from public.organizations
where slug = 'mais-saude'
on conflict (organization_id, slug) do update set
  title = excluded.title,
  status = excluded.status,
  updated_at = now();

insert into public.nps_survey_branches (organization_id, survey_id, filial_slug, filial_nome, active)
select organization_id, id, branch.filial_slug, branch.filial_nome, true
from public.nps_surveys
cross join (
  values
    ('pinheiro', 'Pinheiro'),
    ('junco-do-maranhao', 'Junco do Maranhao'),
    ('sao-bento', 'Sao Bento'),
    ('peri-mirim', 'Peri-Mirim'),
    ('bequimao', 'Bequimao'),
    ('amapa-do-maranhao', 'Amapa do Maranhao')
) as branch(filial_slug, filial_nome)
where slug = 'atendimento'
on conflict (organization_id, survey_id, filial_slug) do update set
  filial_nome = excluded.filial_nome,
  active = excluded.active;

update public.nps_responses responses
set organization_id = surveys.organization_id,
    survey_id = surveys.id,
    survey_branch_id = branches.id,
    filial_nome = coalesce(branches.filial_nome, responses.filial_nome)
from public.nps_surveys surveys
left join public.nps_survey_branches branches
  on branches.survey_id = surveys.id
  and branches.filial_slug = responses.filial_slug
where surveys.slug = 'atendimento'
  and surveys.organization_id = (select id from public.organizations where slug = 'mais-saude')
  and responses.organization_id is null;

alter table public.nps_responses
  alter column organization_id set not null,
  alter column survey_id set not null;

create index if not exists organization_members_user_id_idx
  on public.organization_members (user_id);

create index if not exists nps_surveys_organization_id_idx
  on public.nps_surveys (organization_id);

create index if not exists nps_survey_branches_lookup_idx
  on public.nps_survey_branches (organization_id, survey_id, filial_slug)
  where active is true;

create index if not exists nps_survey_branches_survey_id_idx
  on public.nps_survey_branches (survey_id);

create index if not exists nps_responses_organization_created_at_idx
  on public.nps_responses (organization_id, created_at desc);

create index if not exists nps_responses_survey_created_at_idx
  on public.nps_responses (survey_id, created_at desc);

create index if not exists nps_responses_survey_branch_id_idx
  on public.nps_responses (survey_branch_id);

create or replace function private.user_has_organization_role(target_organization_id uuid, allowed_roles text[] default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members member
    where member.organization_id = target_organization_id
      and member.user_id = (select auth.uid())
      and (allowed_roles is null or member.role = any(allowed_roles))
  );
$$;

revoke all on function private.user_has_organization_role(uuid, text[]) from public;
grant execute on function private.user_has_organization_role(uuid, text[]) to authenticated;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.nps_surveys enable row level security;
alter table public.nps_survey_branches enable row level security;
alter table public.nps_responses enable row level security;

revoke all on table public.organizations from anon, authenticated;
revoke all on table public.organization_members from anon, authenticated;
revoke all on table public.nps_surveys from anon, authenticated;
revoke all on table public.nps_survey_branches from anon, authenticated;
revoke all on table public.nps_responses from anon, authenticated;

grant select on table public.organizations to authenticated;
grant select, insert, update on table public.organization_members to authenticated;
grant select, insert, update on table public.nps_surveys to authenticated;
grant select, insert, update on table public.nps_survey_branches to authenticated;
grant select, update on table public.nps_responses to authenticated;

grant select, insert, update, delete on table public.organizations to service_role;
grant select, insert, update, delete on table public.organization_members to service_role;
grant select, insert, update, delete on table public.nps_surveys to service_role;
grant select, insert, update, delete on table public.nps_survey_branches to service_role;
grant select, insert, update, delete on table public.nps_responses to service_role;

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
  using ((select auth.uid()) = user_id);

drop policy if exists "Organization admins can create memberships" on public.organization_members;
create policy "Organization admins can create memberships"
  on public.organization_members
  for insert
  to authenticated
  with check (private.user_has_organization_role(organization_id, array['owner', 'admin']));

drop policy if exists "Organization admins can update memberships" on public.organization_members;
create policy "Organization admins can update memberships"
  on public.organization_members
  for update
  to authenticated
  using (private.user_has_organization_role(organization_id, array['owner', 'admin']))
  with check (private.user_has_organization_role(organization_id, array['owner', 'admin']));

drop policy if exists "Members can view organization surveys" on public.nps_surveys;
create policy "Members can view organization surveys"
  on public.nps_surveys
  for select
  to authenticated
  using (private.user_has_organization_role(organization_id));

drop policy if exists "Organization admins can manage surveys" on public.nps_surveys;
drop policy if exists "Organization admins can insert surveys" on public.nps_surveys;
create policy "Organization admins can insert surveys"
  on public.nps_surveys
  for insert
  to authenticated
  with check (private.user_has_organization_role(organization_id, array['owner', 'admin']));

drop policy if exists "Organization admins can update surveys" on public.nps_surveys;
create policy "Organization admins can update surveys"
  on public.nps_surveys
  for update
  to authenticated
  using (private.user_has_organization_role(organization_id, array['owner', 'admin']))
  with check (private.user_has_organization_role(organization_id, array['owner', 'admin']));

drop policy if exists "Members can view survey branches" on public.nps_survey_branches;
create policy "Members can view survey branches"
  on public.nps_survey_branches
  for select
  to authenticated
  using (private.user_has_organization_role(organization_id));

drop policy if exists "Organization admins can manage survey branches" on public.nps_survey_branches;
drop policy if exists "Organization admins can insert survey branches" on public.nps_survey_branches;
create policy "Organization admins can insert survey branches"
  on public.nps_survey_branches
  for insert
  to authenticated
  with check (private.user_has_organization_role(organization_id, array['owner', 'admin']));

drop policy if exists "Organization admins can update survey branches" on public.nps_survey_branches;
create policy "Organization admins can update survey branches"
  on public.nps_survey_branches
  for update
  to authenticated
  using (private.user_has_organization_role(organization_id, array['owner', 'admin']))
  with check (private.user_has_organization_role(organization_id, array['owner', 'admin']));

drop policy if exists "Equipe autenticada pode ver respostas NPS" on public.nps_responses;
drop policy if exists "Members can view organization responses" on public.nps_responses;
create policy "Members can view organization responses"
  on public.nps_responses
  for select
  to authenticated
  using (private.user_has_organization_role(organization_id));

drop policy if exists "Organization admins can update responses" on public.nps_responses;
create policy "Organization admins can update responses"
  on public.nps_responses
  for update
  to authenticated
  using (private.user_has_organization_role(organization_id, array['owner', 'admin']))
  with check (private.user_has_organization_role(organization_id, array['owner', 'admin']));