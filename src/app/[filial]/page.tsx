import { notFound } from 'next/navigation';
import Image from 'next/image';
import NpsForm from '@/components/nps-form';
import { isFilialValida, getNomeFilial } from '@/lib/filiais';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ filial: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { filial } = await params;
  const nome = getNomeFilial(filial);
  return {
    title: `Pesquisa de Satisfação | Mais Saúde ${nome}`,
    description: 'Sua opinião é fundamental para nossa melhoria contínua.',
  };
}

export default async function FilialPage({ params }: Props) {
  const { filial } = await params;

  if (!isFilialValida(filial)) {
    notFound();
  }

  const nomeFilial = getNomeFilial(filial);

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{
        background: 'linear-gradient(155deg, #005A50 0%, #00695C 45%, #004039 100%)',
      }}
    >
      {/* Formas orgânicas */}
      <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: '-12%', left: '50%', transform: 'translateX(-50%)', width: '130px', height: '260px', borderRadius: '50%', background: 'rgba(0, 121, 107, 0.40)' }} />
      <div aria-hidden="true" className="absolute pointer-events-none" style={{ bottom: '-18%', left: '-14%', width: '320px', height: '320px', borderRadius: '62% 38% 46% 54% / 60% 44% 56% 40%', background: 'rgba(0, 42, 36, 0.45)' }} />
      <div aria-hidden="true" className="absolute pointer-events-none" style={{ top: '8%', right: '-10%', width: '200px', height: '200px', borderRadius: '40% 60% 55% 45% / 50% 40% 60% 50%', background: 'rgba(0, 77, 64, 0.35)' }} />

      {/* Logo marca d'água */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <Image src="/logo.jpg" alt="" width={420} height={420} className="mix-blend-screen" style={{ filter: 'invert(1)', opacity: 0.18 }} priority />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 flex-1 flex flex-col py-8 px-4 sm:py-12">
        <div className="max-w-lg mx-auto w-full">

          {/* Identidade */}
          <div className="flex flex-col items-center mb-7">
            <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/25 shadow-xl">
              <Image src="/logo.jpg" alt="Logo Mais Saúde" width={54} height={54} className="rounded-2xl object-contain" priority />
            </div>
            <h1 className="mt-4 text-white font-black text-lg sm:text-xl uppercase tracking-tight text-center leading-snug drop-shadow">
              Clínica e Laboratório<br />Mais Saúde
            </h1>
            {/* Badge da filial */}
            <span className="mt-2 px-3 py-1 rounded-full bg-white/20 text-white/90 text-xs font-semibold tracking-wide">
              Unidade {nomeFilial}
            </span>
            <p className="mt-2 text-white/60 text-sm text-center">
              Sua opinião nos ajuda a melhorar sempre.
            </p>
          </div>

          {/* Card do formulário */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <main className="px-5 py-6 sm:px-8 sm:py-8">
              <NpsForm filial={filial} />
            </main>
            <footer className="bg-gray-50 px-6 py-3 text-center border-t border-gray-100">
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} Clínica e Laboratório Mais Saúde — {nomeFilial}
              </p>
            </footer>
          </div>

        </div>
      </div>
    </div>
  );
}
