import SiteHome from '@/components/site-home';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clínica e Laboratório Mais Saúde · Perto de você',
  description: 'Exames, atendimento humano e unidades da Mais Saúde no interior do Maranhão.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Clínica e Laboratório Mais Saúde · Perto de você',
    description: 'Exames, atendimento humano e unidades da Mais Saúde no interior do Maranhão.',
    url: '/',
  },
};

export default function Home() {
  return <SiteHome />;
}
