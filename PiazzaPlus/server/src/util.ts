import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';

/** Wrap an async route so thrown errors become a 500 JSON response. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

/** Validate req.body against a zod schema, returning typed data or sending 400. */
export function parseBody<T>(schema: ZodSchema<T>, req: Request, res: Response): T | null {
  try {
    return schema.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: 'Neispravni podaci.', details: err.flatten() });
    } else {
      res.status(400).json({ error: 'Neispravni podaci.' });
    }
    return null;
  }
}

/** Small artificial delay so mocked "smart" endpoints feel like real work. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Parse a JSON string column, falling back to a default on bad data. */
export function jsonField<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Deterministic seeded pseudo-random generator (xmur3 + mulberry32). Same seed ->
 * same sequence, so a given entity (e.g. a listing id) always yields the same
 * "random-looking" numbers. Used for semi-mocked, data-grounded AI output that is
 * varied across items but stable across requests for one item.
 */
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = (h ^= h >>> 16) >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick a random element from a non-empty array. */
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Today's date as a Serbian-formatted string, e.g. "23.06.2026." */
export function todayStr(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}.`;
}

/** First integer found in a string (e.g. "20 kg" -> 20), else fallback. */
export function firstInt(s: string | null | undefined, fallback: number): number {
  const m = String(s ?? '').match(/\d+/);
  return m ? parseInt(m[0], 10) : fallback;
}
