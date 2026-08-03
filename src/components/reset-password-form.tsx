'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Loader2, LockKeyhole } from 'lucide-react';
import { updateRecoveredPassword, type ResetPasswordState } from '@/app/login/actions';

const INITIAL_STATE: ResetPasswordState = {};

export default function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updateRecoveredPassword, INITIAL_STATE);

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">Nova senha</span>
        <span className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 focus-within:border-teal-700">
          <LockKeyhole className="h-5 w-5 text-slate-400" />
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            className="w-full bg-transparent text-base text-slate-900 outline-none"
            placeholder="Digite a nova senha"
          />
        </span>
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">Confirmar senha</span>
        <span className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 focus-within:border-teal-700">
          <LockKeyhole className="h-5 w-5 text-slate-400" />
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            className="w-full bg-transparent text-base text-slate-900 outline-none"
            placeholder="Repita a nova senha"
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
        Salvar nova senha
      </button>
      <Link href="/login" className="block text-center text-sm font-bold text-teal-900 hover:text-teal-700">
        Voltar para o login
      </Link>
    </form>
  );
}
