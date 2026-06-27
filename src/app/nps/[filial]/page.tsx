import NpsForm from '@/components/nps-form';
import BrandCross from '@/components/brand-cross';
import SiteHeader from '@/components/site-header';
import { getNomeFilial, isFilialValida } from '@/lib/filiais';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ filial: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { filial } = await params;
  const nome = getNomeFilial(filial);

  return {
    title: `NPS ${nome} · Mais Saúde`,
    description: `Avalie sua experiência na unidade ${nome} da Mais Saúde.`,
  };
}

export default async function NpsFilialPage({ params }: Props) {
  const { filial } = await params;

  if (!isFilialValida(filial)) {
    notFound();
  }

  const nomeFilial = getNomeFilial(filial);

  return (
    <main className="site-shell nps-form-page">
      <SiteHeader />
      <section className="nps-form-hero">
        <div className="wrap nps-form-wrap">
          <div className="nps-form-intro">
            <div className="sec-eyebrow">
              <BrandCross />
              Unidade {nomeFilial}
            </div>
            <h1>Sua opinião melhora o cuidado de verdade</h1>
            <p>
              A pesquisa é rápida e vai direto para nossa equipe. Obrigado por ajudar a Mais Saúde a ouvir melhor cada paciente.
            </p>
          </div>
          <div className="nps-form-card">
            <NpsForm filial={filial} />
          </div>
        </div>
      </section>
    </main>
  );
}
