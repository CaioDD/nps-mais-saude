import { google } from 'googleapis';

function getAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error('Credenciais do Google não configuradas no .env.local');
  }

  return new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function appendResposta(dados: Record<string, unknown>) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID não configurado');

  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });

  // Cabeçalho — criado automaticamente na primeira linha se a planilha estiver vazia
  const cabecalho = [
    'Data/Hora',
    'Filial',
    'NPS',
    'Experiência Geral',
    'Atendimento Recepção',
    'Atendimento Coleta',
    'Tempo de Espera',
    'Limpeza e Organização',
    'Prazo de Entrega',
    'Recebeu Orientações',
    'Custo-Benefício',
    'Como Conheceu',
    'Comentários',
  ];

  // Verifica se já tem cabeçalho
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'A1:A1',
  });

  if (!existing.data.values) {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [cabecalho] },
    });
  }

  // Linha de dados
  const linha = [
    new Date(dados.timestamp as string).toLocaleString('pt-BR'),
    dados.filial,
    dados.nps,
    dados.experienciaGeral,
    dados.atendimentoRecepcao,
    dados.atendimentoColeta,
    dados.tempoEspera,
    dados.limpezaOrganizacao,
    dados.prazoEntrega,
    dados.recebeuOrientacoes,
    dados.custoBeneficio,
    dados.comoConheceu,
    dados.comentarios,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [linha] },
  });
}
