import type { Metadata } from 'next';
import LoginForm from '@/components/login-form';

export const metadata: Metadata = {
  title: 'Login NPS',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ reset?: string; auth?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-teal-800">Mais Saude</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Painel de respostas NPS</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Acesse com um usuario cadastrado no Supabase Auth para acompanhar as avaliacoes recebidas.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          {params?.reset === 'success' && (
            <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
              Senha atualizada com sucesso. Entre novamente para acessar o painel.
            </p>
          )}
          {params?.auth === 'invalid' && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              Link invalido ou expirado. Solicite uma nova recuperacao de senha.
            </p>
          )}
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
