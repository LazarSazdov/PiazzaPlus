import type {
  Donation,
  Listing,
  Notification,
  Prediction,
  Product,
  Receipt,
  Recipe,
  Recipient,
  Reservation,
  User,
} from '@prisma/client';
import { jsonField } from './util';

export function publicUser(u: User) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    bio: u.bio,
    role: u.role,
    avatarKey: u.avatarKey,
    dietary: jsonField<string[]>(u.dietary, []),
    allergies: jsonField<string[]>(u.allergies, []),
    settings: jsonField<Record<string, unknown>>(u.settings, {}),
  };
}

export function publicListing(l: Listing) {
  const finalPrice = l.discount > 0 ? Math.round(l.price * (1 - l.discount / 100)) : l.price;
  return { ...l, finalPrice };
}

export function publicRecipe(r: Recipe) {
  return {
    ...r,
    ingredients: jsonField<string[]>(r.ingredients, []),
    steps: jsonField<string[]>(r.steps, []),
  };
}

export function publicReceipt(r: Receipt) {
  return { ...r, items: jsonField<{ name: string; price: number }[]>(r.items, []) };
}

export function publicDonation(d: Donation & { recipient?: Recipient }) {
  return { ...d, items: jsonField<{ name: string; qty: string }[]>(d.items, []) };
}

export function publicPrediction(p: Prediction) {
  return { ...p, series: jsonField<number[]>(p.series, []) };
}

export type { Product, Reservation, Notification, Recipient };
