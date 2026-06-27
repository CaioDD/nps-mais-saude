export const FILIAIS_LIST = [
  {
    slug: 'pinheiro',
    nome: 'Pinheiro',
    tipo: 'Sede · Clínica',
    endereco: 'Matriz · Pinheiro',
    mapaUrl: 'https://maps.app.goo.gl/4jPc8vMu3C74Ge5V8',
    whatsapp: '98 8498-6804',
    whatsappUrl: 'https://wa.me/559884986804',
  },
  {
    slug: 'junco-do-maranhao',
    nome: 'Junco do Maranhão',
    tipo: 'Laboratório',
    mapaUrl: 'https://maps.app.goo.gl/P1vfbaSLA2yEDvBU8?g_st=awb',
    whatsapp: '98 98594-9588',
    whatsappUrl: 'https://wa.me/5598985949588',
  },
  {
    slug: 'sao-bento',
    nome: 'São Bento',
    tipo: 'Laboratório',
    mapaUrl: 'https://maps.app.goo.gl/LsvNxw6WbovQWixe7?g_st=awb',
    whatsapp: '98 98484-0302',
    whatsappUrl: 'https://wa.me/5598984840302',
  },
  {
    slug: 'peri-mirim',
    nome: 'Peri-Mirim',
    tipo: 'Laboratório',
    mapaUrl: 'https://maps.app.goo.gl/YdeEsNdgP2xPte7s6?g_st=awb',
    whatsapp: '98 98467-6945',
    whatsappUrl: 'https://wa.me/5598984676945',
  },
  {
    slug: 'bequimao',
    nome: 'Bequimão',
    tipo: 'Laboratório',
    mapaUrl: 'https://maps.app.goo.gl/D9QC1JSuFmNhq8z86?g_st=awb',
    whatsapp: '98 8568-5514',
    whatsappUrl: 'https://wa.me/559885685514',
  },
  {
    slug: 'amapa-do-maranhao',
    nome: 'Amapá do Maranhão',
    tipo: 'Laboratório',
    mapaUrl: 'https://maps.app.goo.gl/CjoDzLNJKRkDofTi7?g_st=awb',
    whatsapp: '98 98455-2399',
    whatsappUrl: 'https://wa.me/5598984552399',
  },
] as const;

export type FilialSlug = (typeof FILIAIS_LIST)[number]['slug'];

export const FILIAIS: Record<FilialSlug, string> = FILIAIS_LIST.reduce(
  (acc, filial) => {
    acc[filial.slug] = filial.nome;
    return acc;
  },
  {} as Record<FilialSlug, string>,
);

export function isFilialValida(slug: string): boolean {
  return slug in FILIAIS;
}

export function getNomeFilial(slug: string): string {
  return FILIAIS[slug as FilialSlug] ?? slug;
}
