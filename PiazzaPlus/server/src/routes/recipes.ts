import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { publicRecipe } from '../serialize';
import { asyncHandler, delay, parseBody } from '../util';

const router = Router();
router.use(requireAuth);

// GET /api/recipes?type=saved|ai
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const type = String(req.query.type ?? '');
    const where =
      type === 'saved'
        ? { aiGenerated: false }
        : type === 'ai'
          ? { aiGenerated: true }
          : {};
    const recipes = await prisma.recipe.findMany({ where, orderBy: { title: 'asc' } });
    res.json({ recipes: recipes.map(publicRecipe) });
  })
);

// GET /api/recipes/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const recipe = await prisma.recipe.findUnique({ where: { id: req.params.id } });
    if (!recipe) return res.status(404).json({ error: 'Recept nije pronađen.' });
    res.json({ recipe: publicRecipe(recipe) });
  })
);

// Mocked AI generator — returns a fabricated recipe from a few seasonal ingredients.
const generateSchema = z.object({ ingredients: z.array(z.string()).optional() });
const MOCK_TITLES = [
  'Sezonska čorba od povrća',
  'Pečene paprike sa sirom',
  'Salata od paradajza i krastavca',
  'Domaći ajvar',
  'Punjene tikvice',
];

router.post(
  '/generate',
  asyncHandler(async (req: AuthRequest, res) => {
    const data = parseBody(generateSchema, req, res);
    if (!data) return;
    await delay(900); // pretend the model is thinking

    const base = data.ingredients?.length
      ? data.ingredients
      : ['paradajz', 'paprika', 'luk', 'beli luk', 'maslinovo ulje'];
    const title = MOCK_TITLES[base.join('').length % MOCK_TITLES.length];

    const recipe = await prisma.recipe.create({
      data: {
        title,
        description: 'Recept generisan na osnovu sezonskih namirnica sa pijace.',
        ingredients: JSON.stringify(base.map((i) => `${i} - po potrebi`)),
        steps: JSON.stringify([
          'Operite i isecite sve namirnice.',
          'Zagrejte ulje i propržite luk i beli luk.',
          'Dodajte ostalo povrće i začinite po ukusu.',
          'Kuvajte na laganoj vatri 20 minuta i poslužite toplo.',
        ]),
        imageKey: 'recipe_paprikas',
        aiGenerated: true,
        ownerId: req.userId!,
      },
    });
    res.status(201).json({ recipe: publicRecipe(recipe) });
  })
);

export default router;
