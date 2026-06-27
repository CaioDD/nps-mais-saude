import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

// Row indices (0-based) referencing the Dashboard sheet:
// Row 0  → "DASHBOARD — NPS Mais Saúde"
// Row 1  → (vazio)
// Row 2  → Cabeçalho: Filial | Respostas | Promotores | Neutros | Detratores | NPS Score
// Rows 3-8 → dados das 6 filiais
// Row 9  → (vazio)
// Row 10 → TOTAL GERAL
// Row 14 → "Como os clientes conheceram"
// Row 15 → Canal | Total (cabeçalho)
// Rows 16-21 → dados canais

async function main() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const abas = meta.data.sheets ?? [];

  const dashboardSheet = abas.find(s => s.properties?.title === 'Dashboard');
  if (!dashboardSheet?.properties?.sheetId && dashboardSheet?.properties?.sheetId !== 0) {
    throw new Error('Aba "Dashboard" não encontrada. Execute setup-dashboard.ts primeiro.');
  }
  const dashId = dashboardSheet.properties.sheetId!;

  // Recria a aba Gráficos do zero
  const setupRequests: object[] = [];
  const graficosExistente = abas.find(s => s.properties?.title === 'Gráficos');
  if (graficosExistente) {
    setupRequests.push({ deleteSheet: { sheetId: graficosExistente.properties?.sheetId } });
  }
  setupRequests.push({ addSheet: { properties: { title: 'Gráficos', index: 2 } } });

  const setupResult = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests: setupRequests },
  });

  const grafId = setupResult.data.replies
    ?.find(r => r.addSheet)
    ?.addSheet?.properties?.sheetId!;

  console.log('Aba "Gráficos" criada, ID:', grafId);
  await new Promise(r => setTimeout(r, 1500));

  // Helper para range source
  const src = (startRow: number, endRow: number, startCol: number, endCol: number) => ({
    sheetId: dashId,
    startRowIndex: startRow,
    endRowIndex: endRow,
    startColumnIndex: startCol,
    endColumnIndex: endCol,
  });

  const chartRequests = [
    // ── Gráfico 1: NPS Score por Filial ──────────────────────────────────
    {
      addChart: {
        chart: {
          spec: {
            title: 'NPS Score por Filial',
            basicChart: {
              chartType: 'COLUMN',
              legendPosition: 'NO_LEGEND',
              axis: [
                { position: 'BOTTOM_AXIS', title: 'Filial' },
                { position: 'LEFT_AXIS', title: 'NPS Score (-100 a +100)' },
              ],
              domains: [{ domain: { sourceRange: { sources: [src(3, 9, 0, 1)] } } }],
              series: [{
                series: { sourceRange: { sources: [src(3, 9, 5, 6)] } },
                targetAxis: 'LEFT_AXIS',
                color: { red: 0.0, green: 0.588, blue: 0.412 },
              }],
            },
          },
          position: {
            overlayPosition: {
              anchorCell: { sheetId: grafId, rowIndex: 0, columnIndex: 0 },
              offsetXPixels: 10, offsetYPixels: 10,
              widthPixels: 550, heightPixels: 350,
            },
          },
        },
      },
    },

    // ── Gráfico 2: Promotores / Neutros / Detratores (empilhado) ─────────
    {
      addChart: {
        chart: {
          spec: {
            title: 'Promotores × Neutros × Detratores por Filial',
            basicChart: {
              chartType: 'COLUMN',
              stackedType: 'STACKED',
              legendPosition: 'BOTTOM_LEGEND',
              axis: [
                { position: 'BOTTOM_AXIS', title: 'Filial' },
                { position: 'LEFT_AXIS', title: 'Quantidade de Respostas' },
              ],
              domains: [{ domain: { sourceRange: { sources: [src(3, 9, 0, 1)] } } }],
              series: [
                {
                  series: { sourceRange: { sources: [src(2, 9, 2, 3)] } },
                  targetAxis: 'LEFT_AXIS',
                  color: { red: 0.13, green: 0.69, blue: 0.30 }, // verde promotores
                },
                {
                  series: { sourceRange: { sources: [src(2, 9, 3, 4)] } },
                  targetAxis: 'LEFT_AXIS',
                  color: { red: 0.98, green: 0.75, blue: 0.18 }, // amarelo neutros
                },
                {
                  series: { sourceRange: { sources: [src(2, 9, 4, 5)] } },
                  targetAxis: 'LEFT_AXIS',
                  color: { red: 0.90, green: 0.23, blue: 0.23 }, // vermelho detratores
                },
              ],
            },
          },
          position: {
            overlayPosition: {
              anchorCell: { sheetId: grafId, rowIndex: 0, columnIndex: 8 },
              offsetXPixels: 10, offsetYPixels: 10,
              widthPixels: 550, heightPixels: 350,
            },
          },
        },
      },
    },

    // ── Gráfico 3: Volume de respostas por filial (barra horizontal) ──────
    {
      addChart: {
        chart: {
          spec: {
            title: 'Volume de Respostas por Filial',
            basicChart: {
              chartType: 'BAR',
              legendPosition: 'NO_LEGEND',
              axis: [
                { position: 'BOTTOM_AXIS', title: 'Total de Respostas' },
                { position: 'LEFT_AXIS', title: 'Filial' },
              ],
              domains: [{ domain: { sourceRange: { sources: [src(3, 9, 0, 1)] } } }],
              series: [{
                series: { sourceRange: { sources: [src(3, 9, 1, 2)] } },
                targetAxis: 'BOTTOM_AXIS',
                color: { red: 0.25, green: 0.52, blue: 0.96 },
              }],
            },
          },
          position: {
            overlayPosition: {
              anchorCell: { sheetId: grafId, rowIndex: 20, columnIndex: 0 },
              offsetXPixels: 10, offsetYPixels: 10,
              widthPixels: 550, heightPixels: 350,
            },
          },
        },
      },
    },

    // ── Gráfico 4: Como os clientes conheceram (pizza) ────────────────────
    {
      addChart: {
        chart: {
          spec: {
            title: 'Como os Clientes Conheceram o Laboratório',
            pieChart: {
              legendPosition: 'RIGHT_LEGEND',
              threeDimensional: false,
              domain: { sourceRange: { sources: [src(16, 22, 0, 1)] } },
              series: { sourceRange: { sources: [src(16, 22, 1, 2)] } },
            },
          },
          position: {
            overlayPosition: {
              anchorCell: { sheetId: grafId, rowIndex: 20, columnIndex: 8 },
              offsetXPixels: 10, offsetYPixels: 10,
              widthPixels: 550, heightPixels: 350,
            },
          },
        },
      },
    },
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests: chartRequests },
  });

  console.log('✅ 4 gráficos criados na aba "Gráficos"!');
  console.log(`Acesse: https://docs.google.com/spreadsheets/d/${SHEET_ID}`);
}

main().catch(console.error);
