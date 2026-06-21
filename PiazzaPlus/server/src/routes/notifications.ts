import { Router } from 'express';
import { prisma } from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { asyncHandler } from '../util';

const router = Router();
router.use(requireAuth);

// GET /api/notifications?audience=KUPAC|PRODAVAC
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const audience = String(req.query.audience ?? '');
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.userId!,
        ...(audience ? { audience } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ notifications });
  })
);

// DELETE /api/notifications?audience=  (clear all for the audience)
router.delete(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const audience = String(req.query.audience ?? '');
    await prisma.notification.deleteMany({
      where: { userId: req.userId!, ...(audience ? { audience } : {}) },
    });
    res.json({ ok: true });
  })
);

export default router;
