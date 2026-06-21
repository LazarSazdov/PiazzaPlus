import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { asyncHandler, parseBody } from '../util';

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().positive('Količina mora biti veća od nule.'),
});

// POST /api/reservations  (buyer creates a reservation -> NA_CEKANJU)
router.post(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const data = parseBody(createSchema, req, res);
    if (!data) return;

    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) return res.status(404).json({ error: 'Proizvod nije pronađen.' });

    const reservation = await prisma.reservation.create({
      data: {
        buyerId: req.userId!,
        productId: product.id,
        quantity: data.quantity,
        total: Math.round(product.price * data.quantity),
        status: 'NA_CEKANJU',
      },
      include: { product: true },
    });

    const buyer = await prisma.user.findUnique({ where: { id: req.userId! } });

    // Notify the product's seller about the incoming order.
    if (product.sellerId) {
      await prisma.notification.create({
        data: {
          userId: product.sellerId,
          audience: 'PRODAVAC',
          title: 'Nova porudžbina',
          body: `${buyer?.name ?? 'Kupac'} je rezervisao ${data.quantity} ${product.unit} - ${product.name}.`,
        },
      });
    }
    // Confirm receipt to the buyer.
    await prisma.notification.create({
      data: {
        userId: req.userId!,
        audience: 'KUPAC',
        title: 'Rezervacija primljena',
        body: `Vaša rezervacija za ${product.name} čeka potvrdu prodavca.`,
      },
    });

    res.status(201).json({ reservation });
  })
);

// GET /api/reservations  (current buyer's reservations)
router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const reservations = await prisma.reservation.findMany({
      where: { buyerId: req.userId! },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reservations });
  })
);

// GET /api/reservations/incoming  (seller order management — orders for THIS seller's products)
router.get(
  '/incoming',
  asyncHandler(async (req: AuthRequest, res) => {
    const reservations = await prisma.reservation.findMany({
      where: { product: { sellerId: req.userId! } },
      include: { product: true, buyer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reservations });
  })
);

const statusSchema = z.object({ status: z.enum(['NA_CEKANJU', 'POTVRDJENA', 'OTKAZANA']) });

// PATCH /api/reservations/:id/status  (buyer cancels own; seller confirms/declines own product's order)
router.patch(
  '/:id/status',
  asyncHandler(async (req: AuthRequest, res) => {
    const data = parseBody(statusSchema, req, res);
    if (!data) return;

    const existing = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: { product: true },
    });
    if (!existing) return res.status(404).json({ error: 'Rezervacija nije pronađena.' });

    const isBuyer = existing.buyerId === req.userId;
    const isSeller = existing.product.sellerId === req.userId;
    if (!isBuyer && !isSeller) {
      return res.status(403).json({ error: 'Nemate pravo da menjate ovu rezervaciju.' });
    }
    // Buyers may only cancel; sellers may confirm or decline.
    if (isBuyer && !isSeller && data.status !== 'OTKAZANA') {
      return res.status(403).json({ error: 'Kupac može samo da otkaže rezervaciju.' });
    }

    const reservation = await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: data.status },
      include: { product: true },
    });

    // Notify the buyer when the seller resolves the order.
    if (isSeller && (data.status === 'POTVRDJENA' || data.status === 'OTKAZANA')) {
      await prisma.notification.create({
        data: {
          userId: existing.buyerId,
          audience: 'KUPAC',
          title: data.status === 'POTVRDJENA' ? 'Rezervacija potvrđena' : 'Rezervacija odbijena',
          body: `${reservation.product.name}: ${data.status === 'POTVRDJENA' ? 'prodavac je potvrdio vašu porudžbinu.' : 'prodavac nije mogao da prihvati porudžbinu.'}`,
        },
      });
    }

    res.json({ reservation });
  })
);

export default router;
