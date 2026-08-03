'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import { prepareMfa, verifyMfa, type MfaState } from '@/app/login/actions';

const INITIAL_STATE: MfaState = {};

export default function MfaForm() {
  const [prepareState, prepareAction, preparePending] = useActionState(prepareMfa, INITIAL_STATE);
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyMfa, INITIAL_STATE);
  const state = verifyState.error ? verifyState : prepareState;
  const canVerify = Boolean(state.factorId && state.challengeId);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-teal-100 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
        <div className="mb-2 flex items-center gap-2 font-black">
          <ShieldCheck className="h-5 w-5" />
          Verificacao em duas etapas
        </div>
        Use um aplicativo autenticador, como Google Authenticator, Microsoft Authenticator ou 1Password.
      </div>

      {!canVerify && (
        <form action={prepareAction}>
          <button
            type="submit"
            disabled={preparePending}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-900 px-4 py-3 font-bold text-white transition hover:bg-teal-800 disabled:opacity-70"
          >
            {preparePending && <Loader2 className="h-5 w-5 animate-spin" />}
            Preparar autenticador
          </button>
        </form>
      )}

      {state.qrCode && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
          <Image className="mx-auto h-48 w-48" src={state.qrCode} alt="QR Code do autenticador" width={192} height={192} unoptimized />
          {state.secret && <p className="mt-3 break-all text-xs font-semibold text-slate-500">{state.secret}</p>}
        </div>
      )}

      {state.message && <p className="text-sm font-semibold text-slate-600">{state.message}</p>}

      {canVerify && (
        <form action={verifyAction} className="space-y-4">
          <input type="hidden" name="factorId" value={state.factorId} />
          <input type="hidden" name="challengeId" value={state.challengeId} />
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Codigo de 6 digitos</span>
            <span className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 focus-within:border-teal-700">
              <KeyRound className="h-5 w-5 text-slate-400" />
              <input
                name="code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                required
                className="w-full bg-transparent text-base text-slate-900 outline-none"
                placeholder="000000"
              />
            </span>
          </label>
          <button
            type="submit"
            disabled={verifyPending}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-teal-900 px-4 py-3 font-bold text-white transition hover:bg-teal-800 disabled:opacity-70"
          >
            {verifyPending && <Loader2 className="h-5 w-5 animate-spin" />}
            Verificar e entrar
          </button>
        </form>
      )}

      {state.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {state.error}
        </p>
      )}
    </div>
  );
}

