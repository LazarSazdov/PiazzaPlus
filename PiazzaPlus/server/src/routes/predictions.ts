import { Router } from 'express';
import { prisma } from '../db';
import { requireAuth } from '../middleware/auth';
import { publicPrediction } from '../serialize';
import { asyncHandler } from '../util';

const router = Router();
router.use(requireAuth);

// GET /api/predictions  — mocked surplus forecast per product
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const predictions = await prisma.prediction.findMany({ orderBy: { productName: 'asc' } });
    res.json({ predictions: predictions.map(publicPrediction) });
  })
);

// GET /api/predictions/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const prediction = await prisma.prediction.findUnique({ where: { id: req.params.id } });
    if (!prediction) return res.status(404).json({ error: 'Predikcija nije pronađena.' });
    res.json({ prediction: publicPrediction(prediction) });
  })
);

export default router;
