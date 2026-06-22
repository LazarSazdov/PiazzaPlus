import { Router } from 'express';
import { prisma } from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { asyncHandler } from '../util';

const router = Router();
router.use(requireAuth);

/** Returns the audience filter only if it's a valid value, else undefined. */
function audienceFilter(raw: unknown): { audience: string } | undefined {
  const a = String(raw ?? '');
  return a === 'KUPAC' || a === 'PRODAVAC' ? { audience: a } : undefined;
}

// GET /api/notifications?audience=KUPAC|PRODAVAC
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const filter = audienceFilter(req.query.audience);
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId!, ...filter },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ notifications });
  })
);

// DELETE /api/notifications?audience=  (clear all for the audience)
router.delete(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const filter = audienceFilter(req.query.audience);
    await prisma.notification.deleteMany({
      where: { userId: req.userId!, ...filter },
    });
    res.json({ ok: true });
  })
);

export default router;
