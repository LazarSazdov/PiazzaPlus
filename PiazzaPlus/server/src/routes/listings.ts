import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { publicListing } from '../serialize';
import { asyncHandler, parseBody } from '../util';

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  title: z.string().min(1, 'Naziv je obavezan.'),
  description: z.string().optional(),
  category: z.string().optional(),
  quantity: z.string().optional(),
  price: z.number().nonnegative('Cena mora biti pozitivna.'),
  imageUrl: z.string().optional(),
  imageKey: z.string().optional(),
});

// POST /api/listings/voice-draft  — server-side (mocked) speech-to-text for the voice flow.
// Returns a transcript and the structured fields parsed from it.
router.post('/voice-draft', (_req, res) => {
  const transcript = 'Prodajem domaći paradajz, 20 kilograma, cena 160 dinara po kilogramu.';
  res.json({
    transcript,
    fields: { title: 'Paradajz domaći', category: 'Povrće', quantity: '20 kg', price: 160 },
  });
});

// GET /api/listings  (current seller's ads)
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const listings = await prisma.listing.findMany({
      where: { sellerId: req.userId! },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ listings: listings.map(publicListing) });
  })
);

// GET /api/listings/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: 'Oglas nije pronađen.' });
    res.json({ listing: publicListing(listing) });
  })
);

// POST /api/listings
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const data = parseBody(createSchema, req, res);
    if (!data) return;
    const listing = await prisma.listing.create({
      data: {
        sellerId: req.userId!,
        title: data.title,
        description: data.description ?? '',
        category: data.category ?? 'Povrće',
        quantity: data.quantity ?? '',
        price: data.price,
        imageUrl: data.imageUrl,
        imageKey: data.imageKey,
      },
    });
    res.status(201).json({ listing: publicListing(listing) });
  })
);

// PUT /api/listings/:id
router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const data = parseBody(createSchema.partial(), req, res);
    if (!data) return;
    const existing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Oglas nije pronađen.' });
    const listing = await prisma.listing.update({ where: { id: req.params.id }, data });
    res.json({ listing: publicListing(listing) });
  })
);

const discountSchema = z.object({
  discount: z.number().min(0).max(90),
  discountType: z.enum(['NONE', 'MANUAL', 'DYNAMIC']),
});

// PATCH /api/listings/:id/discount
router.patch(
  '/:id/discount',
  asyncHandler(async (req: AuthRequest, res) => {
    const data = parseBody(discountSchema, req, res);
    if (!data) return;
    const existing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Oglas nije pronađen.' });
    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: { discount: data.discount, discountType: data.discountType },
    });
    res.json({ listing: publicListing(listing) });
  })
);

// GET /api/listings/:id/discount-suggestion  — dynamic discount recommendation
router.get(
  '/:id/discount-suggestion',
  asyncHandler(async (req: AuthRequest, res) => {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: 'Oglas nije pronađen.' });

    // Heuristic: older and higher-priced listings get a slightly larger suggested cut.
    const ageDays = Math.floor((Date.now() - new Date(listing.createdAt).getTime()) / 86400000);
    let pct = 12;
    if (listing.price >= 500) pct += 4;
    if (ageDays >= 3) pct += 4;
    pct = Math.min(25, pct);

    res.json({
      recommendedPct: pct,
      reason: `Na osnovu tražnje i predviđenog viška, preporučujemo sniženje od ${pct}% za "${listing.title}".`,
      currentPrice: listing.price,
      newPrice: Math.round(listing.price * (1 - pct / 100)),
    });
  })
);

// DELETE /api/listings/:id
router.delete(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const existing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Oglas nije pronađen.' });
    await prisma.listing.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  })
);

export default router;
