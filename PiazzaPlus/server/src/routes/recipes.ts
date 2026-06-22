import { Router } from 'express';
import { z } from 'zod';
import { filterAllergens } from '../allergens';
import { prisma } from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { publicRecipe } from '../serialize';
import { asyncHandler, delay, jsonField, parseBody } from '../util';

const router = Router();
router.use(requireAuth);

// GET /api/recipes?type=saved|ai
// saved -> recipes the current user has saved; ai -> AI recipes they generated.
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const type = String(req.query.type ?? '');

    if (type === 'saved') {
      const saved = await prisma.savedRecipe.findMany({
        where: { userId: req.userId! },
        include: { recipe: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ recipes: saved.map((s) => publicRecipe(s.recipe, true)) });
    }

    const where = type === 'ai' ? { aiGenerated: true, ownerId: req.userId! } : {};
    const recipes = await prisma.recipe.findMany({ where, orderBy: { title: 'asc' } });
    const savedIds = new Set(
      (await prisma.savedRecipe.findMany({ where: { userId: req.userId! }, select: { recipeId: true } })).map(
        (s) => s.recipeId
      )
    );
    res.json({ recipes: recipes.map((r) => publicRecipe(r, savedIds.has(r.id))) });
  })
);

// GET /api/recipes/:id
router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const recipe = await prisma.recipe.findUnique({ where: { id: req.params.id } });
    if (!recipe) return res.status(404).json({ error: 'Recept nije pronađen.' });
    const saved = await prisma.savedRecipe.findUnique({
      where: { userId_recipeId: { userId: req.userId!, recipeId: recipe.id } },
    });
    res.json({ recipe: publicRecipe(recipe, !!saved) });
  })
);

// POST /api/recipes/:id/save  — toggle saved state for the current user
router.post(
  '/:id/save',
  asyncHandler(async (req: AuthRequest, res) => {
    const recipe = await prisma.recipe.findUnique({ where: { id: req.params.id } });
    if (!recipe) return res.status(404).json({ error: 'Recept nije pronađen.' });
    const key = { userId_recipeId: { userId: req.userId!, recipeId: recipe.id } };
    const existing = await prisma.savedRecipe.findUnique({ where: key });
    if (existing) {
      await prisma.savedRecipe.delete({ where: key });
      return res.json({ saved: false });
    }
    await prisma.savedRecipe.create({ data: { userId: req.userId!, recipeId: recipe.id } });
    res.json({ saved: true });
  })
);

// Mocked AI generator. Picks a RANDOM recipe from a static list and omits any
// ingredient that clashes with the logged-in user's allergies (the recipe still
// returns - e.g. "Pasulj" - it just drops the offending ingredient lines).
const generateSchema = z.object({ ingredients: z.array(z.string()).optional() });

interface StaticRecipe {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  imageKey: string;
}

const STATIC_RECIPES: StaticRecipe[] = [
  {
    title: 'Pasulj sa suvim mesom',
    description: 'Tradicionalni prebranac, idealan za hladne dane.',
    ingredients: ['pasulj - 400g', 'crni luk - 2 kom', 'šargarepa - 1 kom', 'suvo meso - 200g', 'jaja - 1 kom', 'aleva paprika', 'lovorov list'],
    steps: ['Potopite pasulj preko noći.', 'Propržite luk i šargarepu.', 'Dodajte pasulj, meso i začine.', 'Kuvajte na laganoj vatri 1.5 sat.'],
    imageKey: 'recipe_paprikas',
  },
  {
    title: 'Gibanica sa sirom',
    description: 'Hrskava gibanica za doručak ili užinu.',
    ingredients: ['kore - 500g', 'sir - 400g', 'jaja - 4 kom', 'jogurt - 200ml', 'ulje', 'so'],
    steps: ['Umutite sir, jaja i jogurt.', 'Slažite kore i premazujte filom.', 'Pecite 40 minuta na 200°C.'],
    imageKey: 'recipe_gibanica',
  },
  {
    title: 'Sezonska salata',
    description: 'Sveža salata od povrća sa pijace.',
    ingredients: ['paradajz - 3 kom', 'krastavac - 1 kom', 'crni luk - 1/2', 'maslinovo ulje', 'so', 'sirće'],
    steps: ['Operite i isecite povrće.', 'Začinite uljem, solju i sirćetom.', 'Promešajte i poslužite ohlađeno.'],
    imageKey: 'recipe_sezonska_salata',
  },
  {
    title: 'Punjene paprike',
    description: 'Babure punjene mesom i pirinčem u paradajz sosu.',
    ingredients: ['paprika - 8 kom', 'mleveno meso - 500g', 'pirinač - 100g', 'crni luk - 1 kom', 'paradajz sos'],
    steps: ['Očistite paprike.', 'Pomešajte meso, pirinač i luk.', 'Napunite paprike i poređajte u šerpu.', 'Kuvajte u sosu 1 sat.'],
    imageKey: 'recipe_punjene_paprike',
  },
  {
    title: 'Voćni jogurt sa medom',
    description: 'Lagani desert sa sezonskim voćem.',
    ingredients: ['jogurt - 400g', 'jabuke - 1 kom', 'med - 2 kašike', 'orasi - 30g', 'cimet'],
    steps: ['Iseckajte voće.', 'Pomešajte sa jogurtom, medom i orasima.', 'Pospite cimetom i poslužite.'],
    imageKey: 'recipe_vocni_jogurt',
  },
  {
    title: 'Čorba od paradajza',
    description: 'Topla čorba od svežeg paradajza.',
    ingredients: ['paradajz - 1kg', 'šargarepa - 2 kom', 'crni luk - 1 kom', 'pavlaka - 100g', 'začini'],
    steps: ['Skuvajte povrće.', 'Izblendajte do glatke smese.', 'Dodajte pavlaku i začinite.', 'Poslužite toplo.'],
    imageKey: 'recipe_paradajz_corba',
  },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

router.post(
  '/generate',
  asyncHandler(async (req: AuthRequest, res) => {
    const data = parseBody(generateSchema, req, res);
    if (!data) return;
    await delay(900); // pretend the model is thinking

    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    const allergies = jsonField<string[]>(user?.allergies ?? '[]', []);

    const picked = pickRandom(STATIC_RECIPES);
    const ingredients = filterAllergens(picked.ingredients, allergies);
    const description = allergies.length
      ? `${picked.description} Prilagođeno vašim alergijama.`
      : picked.description;

    const recipe = await prisma.recipe.create({
      data: {
        title: picked.title,
        description,
        ingredients: JSON.stringify(ingredients),
        steps: JSON.stringify(picked.steps),
        imageKey: picked.imageKey,
        aiGenerated: true,
        ownerId: req.userId!,
      },
    });
    res.status(201).json({ recipe: publicRecipe(recipe) });
  })
);

export default router;
