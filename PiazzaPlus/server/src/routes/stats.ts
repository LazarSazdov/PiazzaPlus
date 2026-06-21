import { Router } from 'express';
import { prisma } from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { asyncHandler } from '../util';

const router = Router();
router.use(requireAuth);

const DOW = ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub']; // getDay(): 0=Sun
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// GET /api/stats?period=week|month|year
// Real sales aggregation over the current seller's confirmed reservations.
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const period = String(req.query.period ?? 'week');
    const now = new Date();

    // Window start per period
    let from: Date;
    if (period === 'year') from = new Date(now.getFullYear(), 0, 1);
    else if (period === 'month') from = new Date(now.getTime() - 27 * 86400000); // ~4 weeks
    else from = new Date(now.getTime() - 6 * 86400000); // last 7 days

    const sales = await prisma.reservation.findMany({
      where: {
        status: 'POTVRDJENA',
        product: { sellerId: req.userId! },
        createdAt: { gte: from },
      },
      include: { product: { select: { name: true } } },
    });

    let labels: string[] = [];
    let series: number[] = [];

    if (period === 'year') {
      labels = MONTHS;
      series = new Array(12).fill(0);
      for (const s of sales) series[new Date(s.createdAt).getMonth()] += s.total;
    } else if (period === 'month') {
      labels = ['N1', 'N2', 'N3', 'N4'];
      series = [0, 0, 0, 0];
      for (const s of sales) {
        const daysAgo = Math.floor((startOfDay(now).getTime() - startOfDay(new Date(s.createdAt)).getTime()) / 86400000);
        const bucket = Math.min(3, 3 - Math.floor(daysAgo / 7)); // 0..3, most recent week last
        series[Math.max(0, bucket)] += s.total;
      }
    } else {
      // last 7 days, oldest -> newest
      const days: Date[] = [];
      for (let i = 6; i >= 0; i--) days.push(startOfDay(new Date(now.getTime() - i * 86400000)));
      labels = days.map((d) => DOW[d.getDay()]);
      series = days.map((d) =>
        sales
          .filter((s) => startOfDay(new Date(s.createdAt)).getTime() === d.getTime())
          .reduce((sum, s) => sum + s.total, 0)
      );
    }

    const totalValue = sales.reduce((sum, s) => sum + s.total, 0);

    const byProduct = new Map<string, number>();
    for (const s of sales) byProduct.set(s.product.name, (byProduct.get(s.product.name) ?? 0) + s.total);
    const top = [...byProduct.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    res.json({ stats: { period, totalValue, series, labels, top } });
  })
);

export default router;
