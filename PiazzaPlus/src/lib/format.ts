/** Format a number as Serbian dinar amount, e.g. 1590 -> "1.590 RSD". */
export function rsd(amount: number): string {
  const rounded = Math.round(amount);
  const grouped = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${grouped} RSD`;
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
