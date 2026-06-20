import { Router } from 'express';
import { prisma } from '../db';
import { asyncHandler } from '../util';

const router = Router();

// GET /api/products?q=&category=
router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? '').trim().toLowerCase();
    const category = String(req.query.category ?? '').trim();
    const products = await prisma.product.findMany({
      include: { market: true },
      orderBy: { name: 'asc' },
    });
    const filtered = products.filter((p) => {
      const matchesQ = !q || p.name.toLowerCase().includes(q);
      const matchesCat = !category || category === 'Sve' || p.category === category;
      return matchesQ && matchesCat;
    });
    res.json({ products: filtered });
  })
);

// GET /api/products/:id
router.get(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { market: true },
    });
    if (!product) return res.status(404).json({ error: 'Proizvod nije pronađen.' });
    res.json({ product });
  })
);

// GET /api/markets?q=
router.get(
  '/markets',
  asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? '').trim().toLowerCase();
    const markets = await prisma.market.findMany({ orderBy: { name: 'asc' } });
    res.json({ markets: q ? markets.filter((m) => m.name.toLowerCase().includes(q)) : markets });
  })
);

export default router;
