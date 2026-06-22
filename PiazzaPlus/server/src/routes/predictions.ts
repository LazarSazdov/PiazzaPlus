import { Router } from 'express';
import { prisma } from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { asyncHandler, firstInt, seededRandom } from '../util';

const router = Router();
router.use(requireAuth);

const DAYS = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'];
// Demand leans toward the weekend, so surplus does too.
const WEEKDAY_WEIGHT = [1, 1, 1.1, 1.25, 1.5, 1.6, 0.9];

interface ListingLike {
  id: string;
  title: string;
  quantity: string;
  price: number;
}

/**
 * Semi-mocked surplus forecast derived from a real listing. Values come from the
 * listing's own quantity/price plus a deterministic seeded jitter (seeded by the
 * listing id), so each product gets a different but stable 7-day chart.
 */
function predictionFor(listing: ListingLike) {
  const rnd = seededRandom(listing.id);
  const qty = firstInt(listing.quantity, Math.max(5, Math.round(listing.price / 30)));
  const base = Math.max(2, Math.round(qty * 0.18)); // ~18% expected surplus baseline

  const series = WEEKDAY_WEIGHT.map((w) => Math.max(0, Math.round(base * w * (0.6 + rnd() * 0.9))));
  const peakIdx = series.indexOf(Math.max(...series));
  const pct = 10 + Math.round(rnd() * 15);

  return {
    id: listing.id,
    productName: listing.title,
    day: DAYS[peakIdx],
    series,
    recommended: `Najveći višak se očekuje u ${DAYS[peakIdx]}. Razmislite o sniženju od ~${pct}% da izbegnete bacanje.`,
    listingId: listing.id,
  };
}

// GET /api/predictions  — one forecast per the current seller's listings
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const listings = await prisma.listing.findMany({
      where: { sellerId: req.userId! },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ predictions: listings.map(predictionFor) });
  })
);

// GET /api/predictions/:id  — forecast for a single listing (id == listing id)
router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: 'Predikcija nije pronađena.' });
    if (listing.sellerId !== req.userId) return res.status(403).json({ error: 'Nemate pravo za ovu predikciju.' });
    res.json({ prediction: predictionFor(listing) });
  })
);

export default router;
