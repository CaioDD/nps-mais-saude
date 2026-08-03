import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ResetPasswordForm from '@/components/reset-password-form';
import { createUserServerClient, getAuthUser } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Definir nova senha NPS',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ResetPasswordPage() {
  const supabase = await createUserServerClient();

  try {
    await getAuthUser(supabase);
  } catch {
    redirect('/login/forgot-password');
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-800">Mais Saude</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Definir nova senha</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Crie uma nova senha para continuar acessando o painel de respostas NPS.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <ResetPasswordForm />
        </div>
      </section>
    </main>
  );
}
