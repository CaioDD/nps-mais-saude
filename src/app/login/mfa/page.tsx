import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createUserServerClient, getAuthUser, getAuthenticatorAssuranceLevel } from '@/lib/supabase-server';
import MfaForm from '@/components/mfa-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'MFA NPS',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MfaPage() {
  const supabase = await createUserServerClient();

  let alreadyVerified = false;

  try {
    await getAuthUser(supabase);
    const assurance = await getAuthenticatorAssuranceLevel();
    alreadyVerified = assurance.currentLevel === 'aal2';
  } catch {
    redirect('/login');
  }

  if (alreadyVerified) redirect('/dashboard');

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-800">Mais Saude</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Protecao do painel</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Confirme o codigo do autenticador para acessar as respostas NPS.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <MfaForm />
        </div>
      </section>
    </main>
  );
}

