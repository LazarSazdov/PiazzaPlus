/**
 * Central map of bundled Pijaca Plus images. Screens and the server seed reference
 * images by KEY (e.g. "product_paradajz") so the same key resolves on both sides.
 * Use `img(key)` to get a require()'d source for <Image source={...} />.
 */
import { ImageSourcePropType } from 'react-native';

export const images = {
  // Avatars / personas
  kupac: require('../../assets/images/pijaca/kupac.png'),
  prodavac: require('../../assets/images/pijaca/prodavac.png'),

  // Products
  product_paradajz: require('../../assets/images/pijaca/products/paradajz.jpg'),
  product_jabuke: require('../../assets/images/pijaca/products/jabuke.jpg'),
  product_krompir: require('../../assets/images/pijaca/products/krompir.jpg'),
  product_med: require('../../assets/images/pijaca/products/med.jpg'),
  product_jaja: require('../../assets/images/pijaca/products/jaja.jpg'),
  product_paradajz_ceri: require('../../assets/images/pijaca/products/paradajz-ceri.png'),

  // Recipes
  recipe_punjene_paprike: require('../../assets/images/pijaca/recipies/punjene-paprike.jpg'),
  recipe_sezonska_salata: require('../../assets/images/pijaca/recipies/sezonska-salata.jpg'),
  recipe_gibanica: require('../../assets/images/pijaca/recipies/gibanica.jpg'),
  recipe_vocni_jogurt: require('../../assets/images/pijaca/recipies/vocni-jogurt.jpg'),
  recipe_paprikas: require('../../assets/images/pijaca/recipies/paprikas.jpg'),
  recipe_paradajz_corba: require('../../assets/images/pijaca/recipies/paradajz-corba.png'),

  // Maps
  map_heatmap: require('../../assets/images/pijaca/maps/mapa-heatmap.jpg'),
  map_prihvatilista: require('../../assets/images/pijaca/maps/mapa-prihvatilista.jpg'),

  // Other
  pijaca: require('../../assets/images/pijaca/other/pijaca.jpg'),
  pij1: require('../../assets/images/pijaca/other/pij1.jpg'),
  pij2: require('../../assets/images/pijaca/other/pij2.jpg'),
  pij3: require('../../assets/images/pijaca/other/pij3.jpg'),
  pij4: require('../../assets/images/pijaca/other/pij4.jpg'),
  racun: require('../../assets/images/pijaca/other/racun.jpg'),
  don: require('../../assets/images/pijaca/other/don.jpg'),
  don2: require('../../assets/images/pijaca/other/don2.png'),
  donation: require('../../assets/images/pijaca/other/donation.jpg'),
} as const;

export type ImageKey = keyof typeof images;

/** Resolve an image key to a source. Unknown keys (e.g. uploaded URLs) return undefined. */
export function img(key?: string | null): ImageSourcePropType | undefined {
  if (!key) return undefined;
  return (images as Record<string, ImageSourcePropType>)[key];
}
