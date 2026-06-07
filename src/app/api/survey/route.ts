import { NextRequest } from 'next/server';
import { appendResposta } from '@/lib/sheets';
import { isFilialValida } from '@/lib/filiais';

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.filial || !isFilialValida(body.filial)) {
    return Response.json({ error: 'Filial inválida' }, { status: 400 });
  }

  await appendResposta({ ...body, timestamp: body.timestamp ?? new Date().toISOString() });

  return Response.json({ ok: true });
}
