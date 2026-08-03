'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { LockKeyhole, Loader2, Mail } from 'lucide-react';
import { login, type LoginState } from '@/app/login/actions';

const INITIAL_STATE: LoginState = {};

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, INITIAL_STATE);

  return (
    <form action={action} className="space-y-4">
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
            placeholder="gestor@maissaude.com.br"
          />
        </span>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">Senha</span>
        <span className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 focus-within:border-teal-700">
          <LockKeyhole className="h-5 w-5 text-slate-400" />
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full bg-transparent text-base text-slate-900 outline-none"
            placeholder="Sua senha"
          />
        </span>
      </label>
      {state.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-900 px-4 py-3 font-bold text-white transition hover:bg-teal-800 disabled:opacity-70"
      >
        {pending && <Loader2 className="h-5 w-5 animate-spin" />}
        Entrar
      </button>
      <Link href="/login/forgot-password" className="block text-center text-sm font-bold text-teal-900 hover:text-teal-700">
        Esqueci minha senha
      </Link>
    </form>
  );
}
