import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { FILIAIS, getNomeFilial } from '@/lib/filiais';

type AppSupabaseClient = SupabaseClient;

const EXPERIENCE_VALUES = ['Excelente', 'Boa', 'Regular', 'Ruim'] as const;
const RATING_VALUES = ['Excelente', 'Bom', 'Regular', 'Ruim'] as const;
const SPEED_VALUES = ['Muito rapido', 'Adequado', 'Demorado', 'Muito demorado'] as const;
const ORIENTATION_VALUES = ['Sim', 'Mais ou menos', 'Nao'] as const;
const COST_VALUES = ['Excelente', 'Bom', 'Regular', 'Ruim'] as const;
const DISCOVERY_VALUES = ['Indicacao', 'Medico', 'Instagram', 'Google', 'Passando na frente', 'Outros'] as const;

function optionalEnum<T extends readonly [string, ...string[]]>(values: T) {
  return z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.enum(values).optional(),
  );
}

export const surveyPayloadSchema = z.object({
  submissionId: z.uuid(),
  filial: z.string().min(1).max(80).refine((value) => value in FILIAIS, 'Filial invalida'),
  nps: z.number().int().min(0).max(10),
  experienciaGeral: optionalEnum(EXPERIENCE_VALUES),
  atendimentoRecepcao: optionalEnum(RATING_VALUES),
  atendimentoColeta: optionalEnum(RATING_VALUES),
  tempoEspera: optionalEnum(SPEED_VALUES),
  limpezaOrganizacao: optionalEnum(RATING_VALUES),
  prazoEntrega: optionalEnum(SPEED_VALUES),
  recebeuOrientacoes: optionalEnum(ORIENTATION_VALUES),
  custoBeneficio: optionalEnum(COST_VALUES),
  comoConheceu: optionalEnum(DISCOVERY_VALUES),
  comentarios: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined),
    z.string().max(1000).optional(),
  ),
  turnstileToken: z.string().min(1).max(4096).optional(),
});

export type SurveyPayload = z.infer<typeof surveyPayloadSchema>;

export interface OrganizationSummary {
  id: string;
  slug: string;
  name: string;
  role: string;
}

export interface NpsResponseRow {
  id: string;
  created_at: string;
  submitted_at: string | null;
  organization_id: string;
  survey_id: string;
  survey_branch_id: string | null;
  filial_slug: string;
  filial_nome: string;
  nps: number;
  experiencia_geral: string | null;
  atendimento_recepcao: string | null;
  atendimento_coleta: string | null;
  tempo_espera: string | null;
  limpeza_organizacao: string | null;
  prazo_entrega: string | null;
  recebeu_orientacoes: string | null;
  custo_beneficio: string | null;
  como_conheceu: string | null;
  comentarios: string | null;
  nps_surveys?: {
    title: string;
    slug: string;
  } | null;
}

export interface SurveyBranchSummary {
  id: string;
  filial_slug: string;
  filial_nome: string;
}

interface OrganizationRecord {
  id: string;
  slug: string;
  name: string;
}

interface OrganizationMemberRecord {
  organization_id: string;
  role: string;
  organizations: OrganizationRecord | OrganizationRecord[] | null;
}

const NPS_COLUMNS = [
  'id',
  'created_at',
  'submitted_at',
  'organization_id',
  'survey_id',
  'survey_branch_id',
  'filial_slug',
  'filial_nome',
  'nps',
  'experiencia_geral',
  'atendimento_recepcao',
  'atendimento_coleta',
  'tempo_espera',
  'limpeza_organizacao',
  'prazo_entrega',
  'recebeu_orientacoes',
  'custo_beneficio',
  'como_conheceu',
  'comentarios',
].join(',');

function requiredEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? (fallback ? process.env[fallback] : undefined);
  if (!value) throw new Error(`${name} nao configurado`);
  return value;
}

export function getSupabaseUrl() {
  return requiredEnv('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL').replace(/\/$/, '');
}

export function getPublishableKey() {
  return (
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    requiredEnv('SUPABASE_PUBLISHABLE_KEY')
  );
}

export function getSecretKey() {
  return process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? requiredEnv('SUPABASE_SECRET_KEY');
}

export function getTurnstileSiteKey() {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
}

export async function createUserServerClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getPublishableKey(), {
    auth: {
      flowType: 'pkce',
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          });
        } catch {
          // Server Components cannot mutate cookies; Server Actions and Route Handlers can.
        }
      },
    },
  }) as AppSupabaseClient;
}

export function createServiceClient() {
  return createClient(getSupabaseUrl(), getSecretKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'mais-saude-nps-server',
      },
    },
  }) as AppSupabaseClient;
}

export function getAllowedOrigins(requestOrigin?: string | null) {
  const origins = [
    process.env.APP_ORIGIN,
    process.env.URL,
    process.env.DEPLOY_URL,
    process.env.DEPLOY_PRIME_URL,
    requestOrigin,
  ].filter(Boolean) as string[];

  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:3000', 'http://127.0.0.1:3000');
  }

  return Array.from(new Set(origins.map((origin) => origin.replace(/\/$/, ''))));
}

export function isAllowedOrigin(origin: string | null, requestOrigin: string) {
  if (!origin && process.env.NODE_ENV !== 'production') return true;
  if (!origin) return false;
  return getAllowedOrigins(requestOrigin).includes(origin.replace(/\/$/, ''));
}

function allowedHostnames(requestOrigin?: string | null) {
  return getAllowedOrigins(requestOrigin)
    .map((origin) => {
      try {
        return new URL(origin).hostname;
      } catch {
        return null;
      }
    })
    .filter((hostname): hostname is string => Boolean(hostname));
}

export function getClientIp(headersList: Headers) {
  return (
    headersList.get('x-nf-client-connection-ip') ??
    headersList.get('cf-connecting-ip') ??
    headersList.get('x-real-ip') ??
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

export async function verifyTurnstileToken(token: string | undefined, expectedAction: string, headersList: Headers) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  const required = process.env.NODE_ENV === 'production' || Boolean(secret);

  if (!secret) {
    return required ? { ok: false, reason: 'turnstile_not_configured' } : { ok: true };
  }

  if (!token) return { ok: false, reason: 'turnstile_missing' };

  const body = new FormData();
  body.set('secret', secret);
  body.set('response', token);
  body.set('remoteip', getClientIp(headersList));

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
    cache: 'no-store',
  });
  const result = (await response.json()) as {
    success?: boolean;
    hostname?: string;
    action?: string;
    'error-codes'?: string[];
  };

  if (!result.success) return { ok: false, reason: 'turnstile_invalid' };
  if (result.action && result.action !== expectedAction) return { ok: false, reason: 'turnstile_action' };

  const requestOrigin = headersList.get('origin');
  const allowed = allowedHostnames(requestOrigin);
  if (result.hostname && allowed.length && !allowed.includes(result.hostname)) {
    return { ok: false, reason: 'turnstile_hostname' };
  }

  return { ok: true };
}

function oneToOne<T>(value: T | T[] | null) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function formatSupabaseError(error: { message?: string } | null) {
  return error?.message ?? 'Erro ao consultar Supabase';
}

export function validateSurveyPayload(data: unknown) {
  const parsed = surveyPayloadSchema.safeParse(data);
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0]?.message ?? 'Payload invalido' };
  }
  return { data: parsed.data, error: null };
}

export async function submitNpsResponse(data: SurveyPayload) {
  const supabase = createServiceClient();
  const { data: responseId, error } = await supabase.rpc('submit_nps_response', {
    p_submission_id: data.submissionId,
    p_organization_slug: process.env.NPS_DEFAULT_ORGANIZATION_SLUG ?? 'mais-saude',
    p_survey_slug: process.env.NPS_DEFAULT_SURVEY_SLUG ?? 'atendimento',
    p_filial_slug: data.filial,
    p_nps: data.nps,
    p_experiencia_geral: data.experienciaGeral ?? null,
    p_atendimento_recepcao: data.atendimentoRecepcao ?? null,
    p_atendimento_coleta: data.atendimentoColeta ?? null,
    p_tempo_espera: data.tempoEspera ?? null,
    p_limpeza_organizacao: data.limpezaOrganizacao ?? null,
    p_prazo_entrega: data.prazoEntrega ?? null,
    p_recebeu_orientacoes: data.recebeuOrientacoes ?? null,
    p_custo_beneficio: data.custoBeneficio ?? null,
    p_como_conheceu: data.comoConheceu ?? null,
    p_comentarios: data.comentarios ?? null,
  });

  if (error) throw new Error(formatSupabaseError(error));
  return responseId as string;
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createUserServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(formatSupabaseError(error));
  return data;
}

export async function getAuthenticatorAssuranceLevel() {
  const supabase = await createUserServerClient();
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) throw new Error(formatSupabaseError(error));
  return data;
}

export async function signOutCurrentUser() {
  const supabase = await createUserServerClient();
  await supabase.auth.signOut({ scope: 'local' });
}

export async function getAuthUser(supabase: AppSupabaseClient) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error(formatSupabaseError(error));
  return data.user;
}

export async function listUserOrganizations(supabase: AppSupabaseClient) {
  const { data, error } = await supabase
    .from('organization_members')
    .select('organization_id,role,organizations(id,slug,name)')
    .order('created_at', { ascending: true });

  if (error) throw new Error(formatSupabaseError(error));

  return ((data ?? []) as OrganizationMemberRecord[])
    .map((record) => {
      const organization = oneToOne(record.organizations);
      if (!organization) return null;
      return {
        id: organization.id,
        slug: organization.slug,
        name: organization.name,
        role: record.role,
      };
    })
    .filter((organization): organization is OrganizationSummary => organization !== null);
}

export async function listNpsResponses(supabase: AppSupabaseClient, organizationId: string) {
  const { data, error } = await supabase
    .from('nps_responses')
    .select(NPS_COLUMNS)
    .eq('organization_id', organizationId)
    .order('submitted_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) throw new Error(formatSupabaseError(error));
  return (data ?? []) as unknown as NpsResponseRow[];
}

export async function listSurveyBranches(supabase: AppSupabaseClient, organizationId: string) {
  const { data, error } = await supabase
    .from('nps_survey_branches')
    .select('id,filial_slug,filial_nome')
    .eq('organization_id', organizationId)
    .eq('active', true)
    .order('filial_nome', { ascending: true });

  if (error) throw new Error(formatSupabaseError(error));
  return (data ?? []) as unknown as SurveyBranchSummary[];
}

export function toLegacyDisplayName(filialSlug: string) {
  return getNomeFilial(filialSlug);
}
