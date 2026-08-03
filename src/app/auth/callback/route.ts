import { NextResponse, type NextRequest } from 'next/server';
import { createUserServerClient } from '@/lib/supabase-server';

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard';
  return value;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = safeNextPath(requestUrl.searchParams.get('next'));

  if (code) {
    const supabase = await createUserServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }

    console.error('[auth-callback] Falha ao trocar codigo por sessao:', error.message);
  }

  return NextResponse.redirect(new URL('/login?auth=invalid', requestUrl.origin));
}
