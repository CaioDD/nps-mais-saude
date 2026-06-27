import type { Metadata, Viewport } from 'next';
import { Figtree, Fraunces } from 'next/font/google';
import './globals.css';

const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.maissaudelab.com.br'),
  title: {
    default: 'Clínica e Laboratório Mais Saúde',
    template: '%s | Mais Saúde',
  },
  description: 'Exames laboratoriais, toxicológico, ultrassonografia e atendimento próximo em unidades no interior do Maranhão.',
  applicationName: 'Mais Saúde',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Clínica e Laboratório Mais Saúde',
    description: 'Cuidado de laboratório com atenção de verdade no interior do Maranhão.',
    url: '/',
    siteName: 'Mais Saúde',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" className={`${figtree.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
