import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { AuthRequest, requireAuth, signToken } from '../middleware/auth';
import { publicUser } from '../serialize';
import { asyncHandler, parseBody } from '../util';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1, 'Ime je obavezno.'),
  email: z.string().email('Neispravan email.'),
  password: z.string().min(4, 'Šifra mora imati bar 4 znaka.'),
  phone: z.string().optional(),
  role: z.enum(['KUPAC', 'PRODAVAC']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Neispravan email.'),
  password: z.string().min(1, 'Unesite šifru.'),
});

// POST /api/auth/register
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const data = parseBody(registerSchema, req, res);
    if (!data) return;

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(409).json({ error: 'Nalog sa ovim emailom već postoji.' });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone,
        role: data.role ?? 'KUPAC',
        avatarKey: (data.role ?? 'KUPAC') === 'PRODAVAC' ? 'prodavac' : 'kupac',
      },
    });

    res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const data = parseBody(loginSchema, req, res);
    if (!data) return;

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      return res.status(401).json({ error: 'Pogrešan email ili šifra.' });
    }

    res.json({ token: signToken(user.id), user: publicUser(user) });
  })
);

// GET /api/auth/me
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'Korisnik nije pronađen.' });
    res.json({ user: publicUser(user) });
  })
);

// POST /api/auth/become-seller  — flips the current user into the Prodavac role
router.post(
  '/become-seller',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { role: 'PRODAVAC' },
    });
    res.json({ user: publicUser(user) });
  })
);

// POST /api/auth/switch-role  — dev toggle between flows
router.post(
  '/switch-role',
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const current = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!current) return res.status(404).json({ error: 'Korisnik nije pronađen.' });
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { role: current.role === 'PRODAVAC' ? 'KUPAC' : 'PRODAVAC' },
    });
    res.json({ user: publicUser(user) });
  })
);

export default router;
