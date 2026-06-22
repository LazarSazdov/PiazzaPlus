/**
 * Maps each allergy key (as stored on User.allergies) to ingredient keywords.
 * Used to omit allergen ingredient lines from generated recipes - the recipe is
 * still returned (e.g. "Pasulj"), it just drops the matching ingredient lines.
 * Keywords are matched case-insensitively as substrings of the ingredient string;
 * both accented and plain variants are listed so seed data with diacritics matches.
 */
export const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  mleko: ['mleko', 'mleka', 'sir', 'jogurt', 'pavlaka', 'maslac', 'kajmak', 'surutka', 'kackavalj', 'kačkavalj'],
  jaja: ['jaja', 'jaje', 'jajeta', 'belance', 'zumance', 'žumance'],
  gluten: ['brasno', 'brašno', 'kore', 'testenina', 'testo', 'hleb', 'griz', 'mekinje'],
  orasi: ['orah', 'orasi', 'orašasti', 'orasasti', 'lesnik', 'lešnik', 'badem', 'kikiriki'],
  soja: ['soja', 'soje', 'tofu', 'soja sos'],
};

/** Returns ingredient lines that do NOT contain any keyword for the given allergies. */
export function filterAllergens(ingredients: string[], allergies: string[]): string[] {
  const blocked = allergies.flatMap((a) => ALLERGEN_KEYWORDS[a.toLowerCase()] ?? []);
  if (blocked.length === 0) return ingredients;
  return ingredients.filter((line) => {
    const lower = line.toLowerCase();
    return !blocked.some((kw) => lower.includes(kw));
  });
}
