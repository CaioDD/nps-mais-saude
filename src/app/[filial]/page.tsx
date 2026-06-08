import { notFound } from 'next/navigation';
import Image from 'next/image';
import NpsForm from '@/components/nps-form';
import PageBackground from '@/components/page-background';
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
        background: 'linear-gradient(168deg, #4aa6b8 0%, #267585 22%, #1a5264 48%, #10303e 72%, #091c28 100%)',
      }}
    >
      <PageBackground />

      {/* Logo marca d'água */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <Image src="/logo.jpg" alt="" width={420} height={420} className="mix-blend-screen" style={{ filter: 'invert(1)', opacity: 0.18 }} priority />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 flex-1 flex flex-col py-8 px-4 sm:py-12">
        <div className="max-w-lg mx-auto w-full">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              style={{
                width: '300px',
                height: '180px',
                backgroundImage: 'url(/logo.jpg)',
                backgroundSize: '115%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center 75%',
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              }}
              role="img"
              aria-label="Laboratório Mais Saúde"
            />
            {/* Badge da filial */}
            <span className="mt-3 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold tracking-wide">
              Unidade {nomeFilial}
            </span>
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
