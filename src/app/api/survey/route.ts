import { NextRequest } from 'next/server';
import { appendResposta } from '@/lib/sheets';
import { isFilialValida } from '@/lib/filiais';

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.filial || !isFilialValida(body.filial)) {
    return Response.json({ error: 'Filial inválida' }, { status: 400 });
  }

  try {
    await appendResposta({ ...body, timestamp: body.timestamp ?? new Date().toISOString() });
  } catch (err) {
    console.error('[survey] Erro ao salvar no Sheets:', err);
    return Response.json({ error: String(err) }, { status: 500 });
  }

  return Response.json({ ok: true });
}
