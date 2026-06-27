import Link from 'next/link';
import BrandCross from '@/components/brand-cross';
import SiteHeader from '@/components/site-header';
import { FILIAIS_LIST } from '@/lib/filiais';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NPS · Avalie sua experiência | Mais Saúde',
  description: 'Escolha a unidade da Mais Saúde onde você foi atendido e envie sua avaliação.',
};

export default function NpsLandingPage() {
  return (
    <main className="site-shell nps-page">
      <SiteHeader />
      <section className="nps-hero">
        <div className="wrap">
          <div className="sec-eyebrow">
            <BrandCross />
            Pesquisa de satisfação
          </div>
          <h1>Conte como foi sua experiência</h1>
          <p>
            Escolha a unidade onde você foi atendido. Sua resposta ajuda a Mais Saúde a melhorar o cuidado em cada cidade.
          </p>
          <div className="nps-unit-grid" aria-label="Escolha a unidade">
            {FILIAIS_LIST.map((filial) => (
              <Link key={filial.slug} href={`/nps/${filial.slug}`} className="nps-unit-card">
                <span>{filial.tipo}</span>
                <strong>{filial.nome}</strong>
                <small>Avaliar atendimento</small>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
