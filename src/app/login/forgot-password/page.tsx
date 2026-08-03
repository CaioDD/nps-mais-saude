import type { Metadata } from 'next';
import ForgotPasswordForm from '@/components/forgot-password-form';

export const metadata: Metadata = {
  title: 'Recuperar senha NPS',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-800">Mais Saude</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Recuperar senha</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Informe seu e-mail de acesso para receber um link seguro de recuperacao.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <ForgotPasswordForm />
        </div>
      </section>
    </main>
  );
}
