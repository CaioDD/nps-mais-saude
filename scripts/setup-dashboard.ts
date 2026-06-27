import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const FILIAIS = [
  { slug: 'pinheiro',           nome: 'Pinheiro' },
  { slug: 'junco-do-maranhao',  nome: 'Junco do Maranhão' },
  { slug: 'sao-bento',          nome: 'São Bento' },
  { slug: 'peri-mirim',         nome: 'Peri-Mirim' },
  { slug: 'bequimao',           nome: 'Bequimão' },
  { slug: 'amapa-do-maranhao',  nome: 'Amapá do Maranhão' },
];

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // Busca as abas existentes
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const abas = meta.data.sheets ?? [];
  const nomes = abas.map(s => s.properties?.title ?? '');
  console.log('Abas encontradas:', nomes);

  const requests: object[] = [];

  // Renomeia a primeira aba para "Respostas" se ainda não tiver esse nome
  if (!nomes.includes('Respostas')) {
    const primeiraAba = abas[0];
    const sheetId = primeiraAba?.properties?.sheetId;
    requests.push({
      updateSheetProperties: {
        properties: { sheetId, title: 'Respostas' },
        fields: 'title',
      },
    });
  }

  // Cria aba Dashboard se não existir
  if (!nomes.includes('Dashboard')) {
    requests.push({
      addSheet: { properties: { title: 'Dashboard', index: 1 } },
    });
  }

  if (requests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests },
    });
    console.log('Abas configuradas.');
    await new Promise(r => setTimeout(r, 2000));
  }

  // ── Cabeçalho da aba Respostas ──────────────────────────────
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Respostas!A1:M1',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        'Data/Hora', 'Filial', 'NPS',
        'Experiência Geral', 'Atendimento Recepção', 'Atendimento Coleta',
        'Tempo de Espera', 'Limpeza e Organização', 'Prazo de Entrega',
        'Recebeu Orientações', 'Custo-Benefício', 'Como Conheceu', 'Comentários',
      ]],
    },
  });

  // ── Dashboard: NPS por filial ───────────────────────────────
  const header = [['DASHBOARD — NPS Mais Saúde', '', '', '', '', '']];
  const labels = [['Filial', 'Respostas', 'Promotores (9-10)', 'Neutros (7-8)', 'Detratores (0-6)', 'NPS Score']];

  const rows = FILIAIS.map(({ slug, nome }) => {
    const total      = `=COUNTIF(Respostas!B:B;"${slug}")`;
    const promotores = `=COUNTIFS(Respostas!B:B;"${slug}";Respostas!C:C;">8")`;
    const neutros    = `=COUNTIFS(Respostas!B:B;"${slug}";Respostas!C:C;">6";Respostas!C:C;"<9")`;
    const detratores = `=COUNTIFS(Respostas!B:B;"${slug}";Respostas!C:C;"<7")`;
    const nps        = `=IFERROR(ROUND((COUNTIFS(Respostas!B:B;"${slug}";Respostas!C:C;">8")-COUNTIFS(Respostas!B:B;"${slug}";Respostas!C:C;"<7"))/COUNTIF(Respostas!B:B;"${slug}")*100;1);"-")`;
    return [nome, total, promotores, neutros, detratores, nps];
  });

  // Total geral
  const totalGeral = [
    'TOTAL GERAL',
    `=COUNTA(Respostas!B2:B)`,
    `=COUNTIF(Respostas!C2:C;">8")`,
    `=COUNTIFS(Respostas!C2:C;">6";Respostas!C2:C;"<9")`,
    `=COUNTIF(Respostas!C2:C;"<7")`,
    `=IFERROR(ROUND((COUNTIF(Respostas!C2:C;">8")-COUNTIF(Respostas!C2:C;"<7"))/COUNTA(Respostas!C2:C)*100;1);"-")`,
  ];

  // Média NPS geral
  const mediaNps = [
    '', '', '', '', 'Média NPS Geral:',
    `=IFERROR(ROUND(AVERAGE(Respostas!C2:C);1);"-")`,
  ];

  // Satisfação geral (% Excelente na experiência)
  const satisfacao = [
    '', '', '', '', 'Satisfação Geral:',
    `=IFERROR(TEXT(ROUND(COUNTIF(Respostas!D2:D;"Excelente")/COUNTA(Respostas!D2:D)*100;1);"0,0")&"%";"-")`,
  ];

  // Escrita no Dashboard
  const dashValues = [
    ...header,
    [''],
    ...labels,
    ...rows,
    [''],
    totalGeral,
    mediaNps,
    satisfacao,
    [''],
    ['Como os clientes conheceram o laboratório:'],
    ['Canal', 'Total'],
    ['Indicação',          `=COUNTIF(Respostas!L:L;"Indicação")`],
    ['Médico',             `=COUNTIF(Respostas!L:L;"Médico")`],
    ['Instagram',          `=COUNTIF(Respostas!L:L;"Instagram")`],
    ['Google / Internet',  `=COUNTIF(Respostas!L:L;"Google")`],
    ['Passando na frente', `=COUNTIF(Respostas!L:L;"Passando na frente")`],
    ['Outro',              `=COUNTIF(Respostas!L:L;"Outros")`],
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Dashboard!A1',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: dashValues },
  });

  console.log('✅ Dashboard configurado com sucesso!');
  console.log(`Acesse: https://docs.google.com/spreadsheets/d/${SHEET_ID}`);
}

main().catch(console.error);
