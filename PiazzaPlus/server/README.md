# Pijaca Plus — API server

Express + Prisma (SQLite) REST backend for the Pijaca Plus app.

## Setup & run

```bash
cd server
npm install
npm run setup     # prisma generate + db push + seed
npm run dev       # tsx watch on http://localhost:4000  (use `npm start` after `npm run build`)
```

The Expo app reaches this server via `EXPO_PUBLIC_API_URL`:
- Android emulator: `http://10.0.2.2:4000`
- Physical device: `http://<your-LAN-IP>:4000` (same Wi-Fi)

## Demo accounts (seeded)
- Kupac: `ana@pijaca.rs` / `pijaca123`
- Prodavac: `miroslav@pijaca.rs` / `pijaca123`

## Routes
`/api/auth` (register, login, me, become-seller, switch-role) · `/api/products` · `/api/markets` ·
`/api/reservations` (+ `/incoming`, `PATCH /:id/status`) · `/api/listings` (CRUD + `PATCH /:id/discount`) ·
`/api/recipes` (+ `POST /generate` mock AI) · `/api/receipts` (+ `POST /scan` mock OCR) ·
`/api/predictions` · `/api/donations` (+ `/recipients`, `/chatbot` mock NLP, `/report`) ·
`/api/notifications` · `/api/profile` · `/api/uploads` (multipart image).

Mocked "smart" features (AI recipe gen, OCR, surplus prediction, chatbot) return realistic canned
data; everything else is real persistence in `prisma/pijaca.db`.
