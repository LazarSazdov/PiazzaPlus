import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { publicUser } from '../serialize';
import { asyncHandler, parseBody } from '../util';

const router = Router();
router.use(requireAuth);

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  dietary: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  settings: z.record(z.unknown()).optional(),
});

// PUT /api/profile  — edit profile + diet/allergy/settings
router.put(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const data = parseBody(updateSchema, req, res);
    if (!data) return;
    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.dietary !== undefined ? { dietary: JSON.stringify(data.dietary) } : {}),
        ...(data.allergies !== undefined ? { allergies: JSON.stringify(data.allergies) } : {}),
        ...(data.settings !== undefined ? { settings: JSON.stringify(data.settings) } : {}),
      },
    });
    res.json({ user: publicUser(user) });
  })
);

export default router;
