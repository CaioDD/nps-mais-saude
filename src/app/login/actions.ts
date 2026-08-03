'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  createUserServerClient,
  getAuthenticatorAssuranceLevel,
  getClientIp,
  signInWithPassword,
  signOutCurrentUser,
  verifyTurnstileToken,
} from '@/lib/supabase-server';

export interface LoginState {
  error?: string;
}

export interface MfaState {
  error?: string;
  message?: string;
  factorId?: string;
  challengeId?: string;
  qrCode?: string;
  secret?: string;
  needsEnrollment?: boolean;
}

function genericLoginError() {
  return { error: 'Login invalido ou verificacao de seguranca pendente.' };
}

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const turnstileToken = String(formData.get('turnstileToken') ?? '');
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const rate = checkRateLimit(`login:${ip}`, 10, 60 * 1000);
  if (!rate.allowed) return { error: 'Muitas tentativas. Aguarde um minuto e tente novamente.' };

  const turnstile = await verifyTurnstileToken(turnstileToken, 'login', headersList);
  if (!turnstile.ok) return genericLoginError();

  if (!email || !password) {
    return { error: 'Informe e-mail e senha.' };
  }

  let needsMfa = false;

  try {
    await signInWithPassword(email, password);
    const assurance = await getAuthenticatorAssuranceLevel();
    needsMfa = assurance.currentLevel !== 'aal2';
  } catch (error) {
    console.error('[login] Falha ao autenticar:', error instanceof Error ? error.message : 'erro desconhecido');
    return genericLoginError();
  }

  if (needsMfa) redirect('/login/mfa');
  redirect('/dashboard');
}

export async function prepareMfa(state: MfaState, formData: FormData): Promise<MfaState> {
  void state;
  void formData;
  const supabase = await createUserServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { error: 'Sessao expirada. Entre novamente.' };

  const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
  if (factorsError) return { error: 'Nao foi possivel consultar o MFA.' };

  const verifiedFactor = factorsData.totp.find((factor: { status: string }) => factor.status === 'verified');
  const factor = verifiedFactor ?? factorsData.totp[0];

  try {
    if (factor) {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
      if (challengeError) throw challengeError;
      return {
        factorId: factor.id,
        challengeId: challenge.id,
        needsEnrollment: factor.status !== 'verified',
        message: 'Digite o codigo de 6 digitos do seu aplicativo autenticador.',
      };
    }

    const { data: enrolled, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Painel NPS Mais Saude',
    });
    if (enrollError) throw enrollError;

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: enrolled.id });
    if (challengeError) throw challengeError;

    return {
      factorId: enrolled.id,
      challengeId: challenge.id,
      qrCode: enrolled.totp.qr_code,
      secret: enrolled.totp.secret,
      needsEnrollment: true,
      message: 'Escaneie o QR Code e digite o codigo de 6 digitos para concluir o MFA.',
    };
  } catch (error) {
    console.error('[mfa] Falha ao preparar MFA:', error instanceof Error ? error.message : 'erro desconhecido');
    return { error: 'Nao foi possivel preparar o MFA.' };
  }
}

export async function verifyMfa(_state: MfaState, formData: FormData): Promise<MfaState> {
  const factorId = String(formData.get('factorId') ?? '');
  const challengeId = String(formData.get('challengeId') ?? '');
  const code = String(formData.get('code') ?? '').trim();

  if (!factorId || !challengeId || !/^\d{6}$/.test(code)) {
    return { error: 'Informe o codigo de 6 digitos.', factorId, challengeId };
  }

  const supabase = await createUserServerClient();
  const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
  if (error) {
    return { error: 'Codigo invalido ou expirado. Gere um novo desafio.', factorId };
  }

  redirect('/dashboard');
}

export async function logout() {
  try {
    await signOutCurrentUser();
  } finally {
    const cookieStore = await cookies();
    cookieStore.delete('nps_access_token');
    cookieStore.delete('nps_refresh_token');
  }

  redirect('/login');
}


