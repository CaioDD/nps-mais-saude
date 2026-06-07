export const FILIAIS: Record<string, string> = {
  'pinheiro': 'Pinheiro',
  'junco-do-maranhao': 'Junco do Maranhão',
  'sao-bento': 'São Bento',
  'peri-mirim': 'Peri-Mirim',
  'bequimao': 'Bequimão',
  'amapa-do-maranhao': 'Amapá do Maranhão',
};

export function isFilialValida(slug: string): boolean {
  return slug in FILIAIS;
}

export function getNomeFilial(slug: string): string {
  return FILIAIS[slug] ?? slug;
}
