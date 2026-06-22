/** Format a number as Serbian dinar amount, e.g. 1590 -> "1.590 RSD". */
export function rsd(amount: number): string {
  const rounded = Math.round(amount);
  const grouped = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${grouped} RSD`;
}

/** Format an ISO timestamp as Serbian date, e.g. "12.06.2026." */
export function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}.`;
}

const DIET_LABELS: Record<string, string> = {
  vegetarijanska: 'Vegetarijanska',
  veganska: 'Veganska',
  bezglutenska: 'Bez glutena',
  bezlaktozna: 'Bez laktoze',
};

const ALLERGY_LABELS: Record<string, string> = {
  mleko: 'Mleko',
  jaja: 'Jaja',
  gluten: 'Gluten',
  orasi: 'Orašasti plodovi',
  soja: 'Soja',
};

export function dietLabel(key: string): string {
  return DIET_LABELS[key] ?? key;
}

export function allergyLabel(key: string): string {
  return ALLERGY_LABELS[key] ?? key;
}
