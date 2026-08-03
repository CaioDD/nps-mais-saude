'use client';

import Link from 'next/link';
import { useCallback, useState, useActionState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { requestPasswordRecovery, type PasswordRecoveryState } from '@/app/login/actions';
import TurnstileField from '@/components/turnstile-field';

const INITIAL_STATE: PasswordRecoveryState = {};
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordRecovery, INITIAL_STATE);
  const [turnstileToken, setTurnstileToken] = useState('');
  const handleToken = useCallback((token: string) => setTurnstileToken(token), []);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="turnstileToken" value={turnstileToken} />
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">E-mail</span>
        <span className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 focus-within:border-teal-700">
          <Mail className="h-5 w-5 text-slate-400" />
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full bg-transparent text-base text-slate-900 outline-none"
            placeholder="renan@maissaudelab.com.br"
          />
        </span>
      </label>
      <TurnstileField action="password_recovery" siteKey={TURNSTILE_SITE_KEY} onToken={handleToken} />
      {state.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || Boolean(TURNSTILE_SITE_KEY && !turnstileToken)}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-900 px-4 py-3 font-bold text-white transition hover:bg-teal-800 disabled:opacity-70"
      >
        {pending && <Loader2 className="h-5 w-5 animate-spin" />}
        Enviar link de recuperacao
      </button>
      <Link href="/login" className="block text-center text-sm font-bold text-teal-900 hover:text-teal-700">
        Voltar para o login
      </Link>
    </form>
  );
}
