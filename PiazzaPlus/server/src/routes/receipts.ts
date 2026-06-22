import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { publicReceipt } from '../serialize';
import { asyncHandler, delay, parseBody, pickRandom, todayStr } from '../util';

const router = Router();
router.use(requireAuth);

// GET /api/receipts  (history)
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const receipts = await prisma.receipt.findMany({
      where: { ownerId: req.userId! },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ receipts: receipts.map(publicReceipt) });
  })
);

// GET /api/receipts/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const receipt = await prisma.receipt.findUnique({ where: { id: req.params.id } });
    if (!receipt) return res.status(404).json({ error: 'Račun nije pronađen.' });
    res.json({ receipt: publicReceipt(receipt) });
  })
);

// POST /api/receipts/scan  — semi-mocked OCR: builds a random receipt from REAL
// products (real names/prices, random quantities), so each scan differs.
const STORES = ['Najlon pijaca', 'Riblja pijaca', 'Limanska pijaca', 'Zelena pijaca'];

router.post(
  '/scan',
  asyncHandler(async (_req: AuthRequest, res) => {
    await delay(1100); // pretend OCR runs

    const products = await prisma.product.findMany();
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    const count = Math.min(products.length, 3 + Math.floor(Math.random() * 2)); // 3-4 items
    const items = shuffled.slice(0, count).map((p) => {
      const qty = 1 + Math.floor(Math.random() * 3);
      return { name: qty > 1 ? `${p.name} (${qty} ${p.unit})` : p.name, price: Math.round(p.price * qty) };
    });
    const total = items.reduce((sum, it) => sum + it.price, 0);

    res.json({
      parsed: { store: pickRandom(STORES), date: todayStr(), items, total, imageKey: 'racun' },
    });
  })
);

const saveSchema = z.object({
  store: z.string().optional(),
  date: z.string().optional(),
  total: z.number().nonnegative().optional(),
  items: z.array(z.object({ name: z.string(), price: z.number() })).optional(),
  imageKey: z.string().optional(),
});

// POST /api/receipts  — save a (scanned) receipt to history
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const data = parseBody(saveSchema, req, res);
    if (!data) return;
    const receipt = await prisma.receipt.create({
      data: {
        ownerId: req.userId!,
        store: data.store ?? 'Pijaca',
        date: data.date ?? '',
        total: data.total ?? 0,
        items: JSON.stringify(data.items ?? []),
        imageKey: data.imageKey ?? 'racun',
      },
    });
    res.status(201).json({ receipt: publicReceipt(receipt) });
  })
);

export default router;
