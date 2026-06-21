import { Router } from 'express';
import { prisma } from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { publicReceipt } from '../serialize';
import { asyncHandler, delay } from '../util';

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

// POST /api/receipts/scan  — mocked OCR: returns parsed items without saving.
router.post(
  '/scan',
  asyncHandler(async (_req: AuthRequest, res) => {
    await delay(1100); // pretend OCR runs
    res.json({
      parsed: {
        store: 'Zelena pijaca',
        date: '21.06.2026.',
        items: [
          { name: 'Paradajz', price: 180 },
          { name: 'Jabuke', price: 140 },
          { name: 'Med', price: 950 },
          { name: 'Jaja (10 kom)', price: 320 },
        ],
        total: 1590,
        imageKey: 'racun',
      },
    });
  })
);

// POST /api/receipts  — save a (scanned) receipt to history
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const { store, date, items, total, imageKey } = req.body ?? {};
    const receipt = await prisma.receipt.create({
      data: {
        ownerId: req.userId!,
        store: String(store ?? 'Pijaca'),
        date: String(date ?? ''),
        total: Number(total ?? 0),
        items: JSON.stringify(items ?? []),
        imageKey: imageKey ? String(imageKey) : 'racun',
      },
    });
    res.status(201).json({ receipt: publicReceipt(receipt) });
  })
);

export default router;
