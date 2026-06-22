import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { publicDonation } from '../serialize';
import { asyncHandler, delay, parseBody } from '../util';

const router = Router();
router.use(requireAuth);

// GET /api/donations/recipients
router.get(
  '/recipients',
  asyncHandler(async (_req, res) => {
    const recipients = await prisma.recipient.findMany({ orderBy: { name: 'asc' } });
    res.json({ recipients });
  })
);

// GET /api/donations  (current user's donations, for the report)
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const donations = await prisma.donation.findMany({
      where: { donorId: req.userId! },
      include: { recipient: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ donations: donations.map(publicDonation) });
  })
);

const createSchema = z.object({
  recipientId: z.string().min(1),
  items: z.array(z.object({ name: z.string(), qty: z.string(), value: z.number().optional() })).optional(),
  estValue: z.number().optional(),
});

// POST /api/donations
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const data = parseBody(createSchema, req, res);
    if (!data) return;
    const donation = await prisma.donation.create({
      data: {
        donorId: req.userId!,
        recipientId: data.recipientId,
        items: JSON.stringify(data.items ?? []),
        estValue: data.estValue ?? 0,
      },
      include: { recipient: true },
    });
    res.status(201).json({ donation: publicDonation(donation) });
  })
);

// POST /api/donations/chatbot  — mocked NLP shelter assistant
const chatSchema = z.object({ message: z.string().min(1) });
router.post(
  '/chatbot',
  asyncHandler(async (req: AuthRequest, res) => {
    const data = parseBody(chatSchema, req, res);
    if (!data) return;
    await delay(600);
    const text = data.message.toLowerCase();
    let reply: string;
    if (text.includes('hvala')) {
      reply = 'Hvala vama! Vaša donacija mnogo znači našim korisnicima.';
    } else if (text.includes('kada') || text.includes('vreme')) {
      reply = 'Donacije primamo radnim danima od 09:00 do 17:00.';
    } else if (text.includes('gde') || text.includes('adresa')) {
      reply = 'Nalazimo se u Ulici Kralja Petra 12, Novi Sad.';
    } else {
      reply = 'Razumem. Možete doneti višak voća i povrća, a mi ćemo ga podeliti korisnicima. Da li želite da zakažemo preuzimanje?';
    }
    res.json({ reply });
  })
);

// GET /api/donations/report  — summary for the tax/donation report screen
router.get(
  '/report',
  asyncHandler(async (req: AuthRequest, res) => {
    const donations = await prisma.donation.findMany({
      where: { donorId: req.userId! },
      include: { recipient: true },
    });
    const totalValue = donations.reduce((sum, d) => sum + d.estValue, 0);
    res.json({
      report: {
        period: '01.06.2026. - 30.06.2026.',
        count: donations.length,
        totalValue,
        donations: donations.map(publicDonation),
      },
    });
  })
);

// GET /api/donations/:id  (single donation detail) — registered last so it does not
// shadow the static GET routes above (/recipients, /report).
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const donation = await prisma.donation.findUnique({
      where: { id: req.params.id },
      include: { recipient: true },
    });
    if (!donation) return res.status(404).json({ error: 'Donacija nije pronađena.' });
    res.json({ donation: publicDonation(donation) });
  })
);

export default router;
