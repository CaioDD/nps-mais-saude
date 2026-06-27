import { notFound, redirect } from 'next/navigation';
import { isFilialValida } from '@/lib/filiais';

interface Props {
  params: Promise<{ filial: string }>;
}

export default async function FilialRedirectPage({ params }: Props) {
  const { filial } = await params;

  if (!isFilialValida(filial)) {
    notFound();
  }

  redirect(`/nps/${filial}`);
}
