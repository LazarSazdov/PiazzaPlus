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
