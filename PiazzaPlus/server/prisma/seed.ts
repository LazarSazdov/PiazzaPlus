/**
 * Data initializer for Pijaca Plus.
 *
 * Seeds the catalog (markets, products owned by a seller, recipes, predictions,
 * donation recipients) plus two real accounts you can log in with, the seller's
 * listings, and a small, coherent set of orders so seller stats/order-management
 * have genuine data. Everything here is real persisted data - there are no UI
 * prefills. Idempotent: clears the relevant tables first, then re-creates.
 */
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);

async function main() {
  // Wipe (children first) for a clean, repeatable seed
  await prisma.notification.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.market.deleteMany();
  await prisma.recipient.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('pijaca123', 10);

  const ana = await prisma.user.create({
    data: {
      name: 'Ana Petrović',
      email: 'ana@pijaca.rs',
      passwordHash,
      phone: '+381 64 123 4567',
      bio: 'Volim sveže, domaće i sezonsko. Kupujem na pijaci svake subote.',
      role: 'KUPAC',
      avatarKey: 'kupac',
      dietary: JSON.stringify(['vegetarijanska']),
      allergies: JSON.stringify(['mleko']),
    },
  });

  const miroslav = await prisma.user.create({
    data: {
      name: 'Miroslav Jovanović',
      email: 'miroslav@pijaca.rs',
      passwordHash,
      phone: '+381 63 987 6543',
      bio: 'Proizvođač iz Futoga. Prodajem povrće i med već 30 godina.',
      role: 'PRODAVAC',
      avatarKey: 'prodavac',
    },
  });

  const market = await prisma.market.create({
    data: { name: 'Najlon pijaca', city: 'Novi Sad', workHours: '06:00 - 14:00', imageKey: 'pijaca' },
  });
  await prisma.market.create({
    data: { name: 'Riblja pijaca', city: 'Novi Sad', workHours: '07:00 - 15:00', imageKey: 'pijaca' },
  });

  // Catalog products, owned by the seller (Miroslav).
  const products = [
    { name: 'Paradajz', description: 'Domaći crveni paradajz, ubran jutros.', price: 180, unit: 'kg', category: 'Povrće', imageKey: 'product_paradajz' },
    { name: 'Jabuke', description: 'Sorta ajdared, slatke i sočne.', price: 140, unit: 'kg', category: 'Voće', imageKey: 'product_jabuke' },
    { name: 'Krompir', description: 'Beli krompir iz Futoga.', price: 90, unit: 'kg', category: 'Povrće', imageKey: 'product_krompir' },
    { name: 'Med', description: 'Bagremov med, tegla 1kg.', price: 950, unit: 'tegla', category: 'Ostalo', imageKey: 'product_med' },
    { name: 'Jaja', description: 'Domaća jaja, pakovanje od 10 komada.', price: 320, unit: 'pak', category: 'Ostalo', imageKey: 'product_jaja' },
    { name: 'Čeri paradajz', description: 'Slatki čeri paradajz u korpici.', price: 220, unit: 'korpa', category: 'Povrće', imageKey: 'product_paradajz_ceri' },
  ];
  const createdProducts = [];
  for (const p of products) {
    createdProducts.push(
      await prisma.product.create({
        data: { ...p, sellerName: 'Miroslav J.', sellerId: miroslav.id, marketId: market.id },
      })
    );
  }

  // Recipes (catalog) - saved + AI-flagged samples
  const recipes = [
    { title: 'Punjene paprike', imageKey: 'recipe_punjene_paprike', ingredients: ['paprika - 8 kom', 'mleveno meso - 500g', 'pirinač - 100g', 'luk - 1 kom'], steps: ['Operite i očistite paprike.', 'Pomešajte meso, pirinač i luk.', 'Napunite paprike i poređajte u šerpu.', 'Kuvajte u paradajz sosu 1 sat.'] },
    { title: 'Sezonska salata', imageKey: 'recipe_sezonska_salata', ingredients: ['paradajz - 2 kom', 'krastavac - 1 kom', 'luk - 1/2', 'maslinovo ulje'], steps: ['Isecite povrće.', 'Začinite solju i uljem.', 'Promešajte i poslužite.'] },
    { title: 'Gibanica', imageKey: 'recipe_gibanica', ingredients: ['kore - 500g', 'sir - 400g', 'jaja - 4 kom', 'kisela voda'], steps: ['Umutite sir i jaja.', 'Slažite kore i fil.', 'Pecite 40 minuta na 200°C.'] },
    { title: 'Voćni jogurt', imageKey: 'recipe_vocni_jogurt', ingredients: ['jogurt - 400g', 'jabuke - 1 kom', 'med - 2 kašike'], steps: ['Iseckajte voće.', 'Pomešajte sa jogurtom i medom.', 'Ohladite i poslužite.'] },
    { title: 'Paprikaš', imageKey: 'recipe_paprikas', ingredients: ['piletina - 800g', 'paprika - 3 kom', 'luk - 2 kom', 'paradajz'], steps: ['Propržite luk.', 'Dodajte meso i papriku.', 'Dinstajte uz dodatak vode 45 min.'], ai: true },
    { title: 'Čorba od paradajza', imageKey: 'recipe_paradajz_corba', ingredients: ['paradajz - 1kg', 'šargarepa - 2 kom', 'začini'], steps: ['Skuvajte povrće.', 'Izblendajte.', 'Začinite i poslužite toplo.'], ai: true },
  ];
  for (const r of recipes) {
    await prisma.recipe.create({
      data: {
        title: r.title,
        description: 'Tradicionalni domaći recept.',
        ingredients: JSON.stringify(r.ingredients),
        steps: JSON.stringify(r.steps),
        imageKey: r.imageKey,
        aiGenerated: r.ai ?? false,
        ownerId: r.ai ? ana.id : null,
      },
    });
  }

  // Seller listings (ads the seller manages)
  await prisma.listing.create({
    data: { sellerId: miroslav.id, title: 'Paradajz - veleprodaja', description: 'Sveže ubran, idealan za zimnicu.', category: 'Povrće', quantity: '50 kg', price: 160, imageKey: 'product_paradajz', createdAt: daysAgo(4) },
  });
  await prisma.listing.create({
    data: { sellerId: miroslav.id, title: 'Bagremov med 1kg', description: 'Prirodan, nefiltriran.', category: 'Ostalo', quantity: '20 tegli', price: 950, imageKey: 'product_med', discount: 15, discountType: 'MANUAL', createdAt: daysAgo(2) },
  });
  await prisma.listing.create({
    data: { sellerId: miroslav.id, title: 'Krompir beli', description: 'Iz Futoga, vreća 25kg.', category: 'Povrće', quantity: '10 vreća', price: 85, imageKey: 'product_krompir', createdAt: daysAgo(1) },
  });

  // Historical CONFIRMED sales (Ana buying from Miroslav) so seller stats are real.
  const salesPlan = [
    { p: 0, q: 3, d: 1 },
    { p: 3, q: 1, d: 2 },
    { p: 1, q: 4, d: 3 },
    { p: 0, q: 2, d: 4 },
    { p: 2, q: 5, d: 5 },
    { p: 4, q: 2, d: 6 },
    { p: 3, q: 2, d: 12 },
    { p: 1, q: 6, d: 20 },
  ];
  for (const s of salesPlan) {
    const prod = createdProducts[s.p];
    await prisma.reservation.create({
      data: {
        buyerId: ana.id,
        productId: prod.id,
        quantity: s.q,
        total: Math.round(prod.price * s.q),
        status: 'POTVRDJENA',
        createdAt: daysAgo(s.d),
      },
    });
  }

  // One live PENDING order for the seller's order-management screen.
  const pending = await prisma.reservation.create({
    data: {
      buyerId: ana.id,
      productId: createdProducts[0].id,
      quantity: 2,
      total: createdProducts[0].price * 2,
      status: 'NA_CEKANJU',
      createdAt: daysAgo(0),
    },
  });

  // Buyer purchase history (a saved receipt)
  await prisma.receipt.create({
    data: {
      ownerId: ana.id,
      store: 'Najlon pijaca',
      date: '14.06.2026.',
      total: 1290,
      items: JSON.stringify([
        { name: 'Paradajz', price: 360 },
        { name: 'Jabuke', price: 280 },
        { name: 'Med', price: 650 },
      ]),
      imageKey: 'racun',
    },
  });

  // Surplus predictions (forecast data)
  await prisma.prediction.create({
    data: { productName: 'Paradajz', day: 'Petak', series: JSON.stringify([4, 6, 5, 8, 12, 7, 3]), recommended: 'Predlog: snizite cenu za 15% u petak da izbegnete višak.' },
  });
  await prisma.prediction.create({
    data: { productName: 'Jabuke', day: 'Subota', series: JSON.stringify([2, 3, 4, 5, 6, 9, 4]), recommended: 'Predlog: pripremite donaciju viška u subotu uveče.' },
  });

  // Donation recipients + one recorded donation
  const shelter = await prisma.recipient.create({
    data: { name: 'Narodna kuhinja NS', city: 'Novi Sad', logoKey: 'donation' },
  });
  await prisma.recipient.create({
    data: { name: 'Prihvatilište Sigurna kuća', city: 'Novi Sad', logoKey: 'don2' },
  });
  await prisma.donation.create({
    data: {
      donorId: miroslav.id,
      recipientId: shelter.id,
      items: JSON.stringify([{ name: 'Paradajz', qty: '10 kg' }, { name: 'Krompir', qty: '15 kg' }]),
      estValue: 3000,
      createdAt: daysAgo(7),
    },
  });

  // Notifications matching the seeded orders
  await prisma.notification.create({
    data: { userId: ana.id, audience: 'KUPAC', title: 'Rezervacija primljena', body: 'Vaša rezervacija za Paradajz čeka potvrdu prodavca.' },
  });
  await prisma.notification.create({
    data: { userId: miroslav.id, audience: 'PRODAVAC', title: 'Nova porudžbina', body: 'Ana Petrović je rezervisala 2 kg - Paradajz.' },
  });

  console.log(`Seed gotov. Nalozi: ana@pijaca.rs (kupac), miroslav@pijaca.rs (prodavac). Šifra: pijaca123. Aktivna porudžbina: ${pending.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
