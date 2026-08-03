import { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  getClientIp,
  isAllowedOrigin,
  submitNpsResponse,
  validateSurveyPayload,
  verifyTurnstileToken,
} from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') ?? '0');
  if (contentLength > MAX_BODY_BYTES) {
    return jsonError('Payload muito grande.', 413);
  }

  const requestOrigin = request.nextUrl.origin;
  if (!isAllowedOrigin(request.headers.get('origin'), requestOrigin)) {
    return jsonError('Origem nao autorizada.', 403);
  }

  const ip = getClientIp(request.headers);
  const rate = checkRateLimit(`survey:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
  if (!rate.allowed) {
    return jsonError('Muitas tentativas. Aguarde um minuto e tente novamente.', 429);
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return jsonError('Payload muito grande.', 413);
    }
    body = JSON.parse(rawBody);
  } catch {
    return jsonError('JSON invalido.', 400);
  }

  const validation = validateSurveyPayload(body);
  if (validation.error || !validation.data) {
    return jsonError(validation.error ?? 'Payload invalido.', 400);
  }

  const turnstile = await verifyTurnstileToken(validation.data.turnstileToken, 'nps_submit', request.headers);
  if (!turnstile.ok) {
    return jsonError('Nao foi possivel validar a protecao do formulario.', 403);
  }

  try {
    const id = await submitNpsResponse(validation.data);
    return Response.json({ ok: true, id });
  } catch (error) {
    console.error('[survey] Falha ao salvar resposta NPS:', error instanceof Error ? error.message : 'erro desconhecido');
    return jsonError('Nao foi possivel salvar sua resposta agora.', 500);
  }
}
