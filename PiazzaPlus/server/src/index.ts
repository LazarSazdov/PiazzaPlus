import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import authRoutes from './routes/auth';
import catalogRoutes from './routes/catalog';
import donationRoutes from './routes/donations';
import listingRoutes from './routes/listings';
import notificationRoutes from './routes/notifications';
import predictionRoutes from './routes/predictions';
import profileRoutes from './routes/profile';
import receiptRoutes from './routes/receipts';
import recipeRoutes from './routes/recipes';
import reservationRoutes from './routes/reservations';
import statsRoutes from './routes/stats';
import uploadRoutes from './routes/uploads';

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Static uploaded images
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'Pijaca Plus API' }));

app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes); // /api/products, /api/markets
app.use('/api/reservations', reservationRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/uploads', uploadRoutes);

// 404
app.use((_req, res) => res.status(404).json({ error: 'Ruta nije pronađena.' }));

// Error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Greška na serveru.' });
});

// Bind IPv4 0.0.0.0 explicitly: adb reverse forwards to 127.0.0.1 (IPv4), so an
// IPv6-only (::) bind would be unreachable from an Android emulator over the tunnel.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pijaca Plus API sluša na http://0.0.0.0:${PORT}`);
});
