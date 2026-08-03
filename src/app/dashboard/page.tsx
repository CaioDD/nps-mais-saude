import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowRight,
  BarChart3,
  Building2,
  LogOut,
  MessageSquareText,
  Star,
  UsersRound,
} from 'lucide-react';
import { logout } from '@/app/login/actions';
import {
  createUserServerClient,
  getAuthenticatorAssuranceLevel,
  getAuthUser,
  listNpsResponses,
  listSurveyBranches,
  listUserOrganizations,
  type NpsResponseRow,
  type SurveyBranchSummary,
} from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard NPS',
  robots: {
    index: false,
    follow: false,
  },
};

function pct(value: number, total: number) {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Fortaleza',
  }).format(new Date(value));
}

function getScoreGroups(rows: NpsResponseRow[]) {
  return rows.reduce(
    (acc, row) => {
      if (row.nps >= 9) acc.promoters += 1;
      else if (row.nps >= 7) acc.passives += 1;
      else acc.detractors += 1;
      return acc;
    },
    { promoters: 0, passives: 0, detractors: 0 },
  );
}

function getMetrics(rows: NpsResponseRow[]) {
  const total = rows.length;
  const average = total ? rows.reduce((sum, row) => sum + row.nps, 0) / total : 0;
  const groups = getScoreGroups(rows);
  const npsScore = total ? Math.round(((groups.promoters - groups.detractors) / total) * 100) : 0;
  const comments = rows.filter((row) => row.comentarios?.trim()).length;

  return { total, average, groups, npsScore, comments };
}

function scoreTone(score: number, hasResponses: boolean) {
  if (!hasResponses) return 'bg-slate-100 text-slate-500';
  if (score >= 9) return 'bg-emerald-100 text-emerald-800';
  if (score >= 7) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

function dashboardHref(org: string, filial?: string) {
  return {
    pathname: '/dashboard',
    query: filial ? { org, filial } : { org },
  };
}

type BranchMetrics = SurveyBranchSummary & ReturnType<typeof getMetrics>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; filial?: string }>;
}) {
  const supabase = await createUserServerClient();

  let user: Awaited<ReturnType<typeof getAuthUser>> | null = null;
  let organizations: Awaited<ReturnType<typeof listUserOrganizations>> = [];

  let needsMfa = false;

  try {
    const assurance = await getAuthenticatorAssuranceLevel();
    needsMfa = assurance.currentLevel !== 'aal2';
    if (!needsMfa) {
      [user, organizations] = await Promise.all([getAuthUser(supabase), listUserOrganizations(supabase)]);
    }
  } catch (error) {
    console.error('[dashboard] Sessao invalida ou erro ao carregar organizacoes:', error);
    redirect('/login');
  }

  if (needsMfa) redirect('/login/mfa');
  if (!user) redirect('/login');

  if (!organizations.length) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-6 text-center text-slate-950">
        <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <Building2 className="mx-auto mb-4 h-10 w-10 text-teal-800" />
          <h1 className="text-2xl font-black">Sem organizacao vinculada</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Seu usuario existe no Supabase Auth, mas ainda nao foi associado a uma empresa em organization_members.
          </p>
          <form action={logout} className="mt-5">
            <button className="rounded-lg bg-teal-900 px-4 py-3 font-bold text-white">Sair</button>
          </form>
        </div>
      </main>
    );
  }

  const query = await searchParams;
  const selectedOrganization = organizations.find((organization) => organization.slug === query.org) ?? organizations[0];

  let rows: NpsResponseRow[] = [];
  let branches: SurveyBranchSummary[] = [];

  try {
    [rows, branches] = await Promise.all([
      listNpsResponses(supabase, selectedOrganization.id),
      listSurveyBranches(supabase, selectedOrganization.id),
    ]);
  } catch (error) {
    console.error('[dashboard] Erro ao carregar dados NPS:', error);
  }

  const selectedBranch = query.filial ? branches.find((branch) => branch.filial_slug === query.filial) : undefined;
  const visibleRows = selectedBranch ? rows.filter((row) => row.filial_slug === selectedBranch.filial_slug) : rows;
  const visibleMetrics = getMetrics(visibleRows);
  const overallMetrics = getMetrics(rows);
  const branchMetrics: BranchMetrics[] = branches
    .map((branch) => ({
      ...branch,
      ...getMetrics(rows.filter((row) => row.filial_slug === branch.filial_slug)),
    }))
    .sort((a, b) => {
      if (!a.total && b.total) return 1;
      if (a.total && !b.total) return -1;
      return b.average - a.average || b.total - a.total;
    });

  const viewTitle = selectedBranch ? selectedBranch.filial_nome : 'Todas as filiais';
  const latestRows = visibleRows.slice(0, 10);

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-800">Mais Saude</p>
            <h1 className="text-2xl font-black tracking-tight">Painel de satisfacao</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-slate-500 sm:inline">{user.email}</span>
            <form action={logout}>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-teal-700 hover:text-teal-800"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-500">{selectedOrganization.name}</p>
            <h2 className="text-2xl font-black tracking-tight">{viewTitle}</h2>
          </div>
          {organizations.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {organizations.map((organization) => (
                <Link
                  key={organization.id}
                  href={dashboardHref(organization.slug)}
                  className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                    organization.id === selectedOrganization.id
                      ? 'border-teal-800 bg-teal-900 !text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-teal-700 hover:text-teal-800'
                  }`}
                >
                  {organization.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <nav aria-label="Filtrar por filial" className="mt-5 overflow-x-auto border-y border-slate-200 py-3">
          <div className="flex min-w-max gap-2">
            <Link
              href={dashboardHref(selectedOrganization.slug)}
              className={`rounded-lg px-3 py-2 text-sm font-black transition ${
                !selectedBranch ? 'bg-slate-950 !text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              Visao geral
            </Link>
            {branches.map((branch) => (
              <Link
                key={branch.id}
                href={dashboardHref(selectedOrganization.slug, branch.filial_slug)}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                  selectedBranch?.id === branch.id
                    ? 'bg-teal-900 !text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                {branch.filial_nome}
              </Link>
            ))}
          </div>
        </nav>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={<UsersRound />} label="Respostas" value={String(visibleMetrics.total)} />
          <Metric
            icon={<Star />}
            label={selectedBranch ? 'Nota da filial' : 'Media geral'}
            value={visibleMetrics.average.toFixed(1)}
            detail={selectedBranch ? `Rede: ${overallMetrics.average.toFixed(1)}` : undefined}
          />
          <Metric icon={<BarChart3 />} label="NPS" value={String(visibleMetrics.npsScore)} />
          <Metric icon={<MessageSquareText />} label="Comentarios" value={String(visibleMetrics.comments)} />
        </div>

        {!selectedBranch && (
          <section className="mt-6 overflow-hidden border-y border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-4">
              <div>
                <h2 className="font-black">Desempenho por filial</h2>
                <p className="mt-1 text-sm text-slate-500">Comparacao rapida de todas as unidades da rede.</p>
              </div>
              <span className="text-sm font-bold text-slate-500">
                Media geral <strong className="ml-1 text-lg text-slate-950">{overallMetrics.average.toFixed(1)}</strong>
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-left text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Filial</th>
                    <th className="px-4 py-3">Nota media</th>
                    <th className="px-4 py-3">Respostas</th>
                    <th className="px-4 py-3">Promotores</th>
                    <th className="px-4 py-3">Comentarios</th>
                    <th className="w-14 px-4 py-3">
                      <span className="sr-only">Abrir detalhes</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {branchMetrics.map((branch) => (
                    <tr key={branch.id} className="transition hover:bg-slate-50">
                      <td className="whitespace-nowrap px-4 py-4 font-black">{branch.filial_nome}</td>
                      <td className="min-w-52 px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex min-w-12 justify-center rounded-lg px-2 py-1 font-black ${scoreTone(branch.average, Boolean(branch.total))}`}>
                            {branch.total ? branch.average.toFixed(1) : '-'}
                          </span>
                          <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full bg-teal-700"
                              style={{ width: branch.total ? `${Math.min(branch.average * 10, 100)}%` : '0%' }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-bold">{branch.total}</td>
                      <td className="px-4 py-4 text-slate-600">{pct(branch.groups.promoters, branch.total)}</td>
                      <td className="px-4 py-4 text-slate-600">{branch.comments}</td>
                      <td className="px-4 py-4">
                        <Link
                          href={dashboardHref(selectedOrganization.slug, branch.filial_slug)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-teal-50 hover:text-teal-800"
                          title={`Ver detalhes de ${branch.filial_nome}`}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {!branchMetrics.length && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center font-semibold text-slate-500">
                        Nenhuma filial cadastrada para esta organizacao.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="self-start rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-black uppercase tracking-[0.12em] text-slate-500">
              Distribuicao {selectedBranch ? 'da filial' : 'geral'}
            </h2>
            <div className="mt-4 space-y-4">
              <ScoreBar
                label="Promotores"
                value={visibleMetrics.groups.promoters}
                total={visibleMetrics.total}
                color="bg-emerald-500"
              />
              <ScoreBar
                label="Neutros"
                value={visibleMetrics.groups.passives}
                total={visibleMetrics.total}
                color="bg-amber-400"
              />
              <ScoreBar
                label="Detratores"
                value={visibleMetrics.groups.detractors}
                total={visibleMetrics.total}
                color="bg-red-500"
              />
            </div>
          </aside>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="font-black">
                {selectedBranch ? `Respostas de ${selectedBranch.filial_nome}` : 'Ultimas respostas da rede'}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-left text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Filial</th>
                    <th className="px-4 py-3">Nota</th>
                    <th className="px-4 py-3">Atendimento</th>
                    <th className="px-4 py-3">Comentario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {latestRows.map((row) => (
                    <tr key={row.id} className="align-top">
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                        {formatDate(row.submitted_at ?? row.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold">{row.filial_nome}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex min-w-10 justify-center rounded-lg px-2 py-1 font-black ${scoreTone(row.nps, true)}`}>
                          {row.nps}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {row.atendimento_recepcao || '-'} / {row.atendimento_coleta || '-'}
                      </td>
                      <td className="max-w-md px-4 py-3 text-slate-700">{row.comentarios || '-'}</td>
                    </tr>
                  ))}
                  {!latestRows.length && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center font-semibold text-slate-500">
                        Nenhuma resposta recebida nesta visao.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <strong className="block text-3xl font-black tracking-tight">{value}</strong>
        {detail && <span className="pb-1 text-xs font-bold text-slate-500">{detail}</span>}
      </div>
    </div>
  );
}

function ScoreBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-bold">{label}</span>
        <span className="font-black text-slate-500">
          {value} <span className="font-semibold">({pct(value, total)})</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${color}`} style={{ width: pct(value, total) }} />
      </div>
    </div>
  );
}





