export type Role = 'KUPAC' | 'PRODAVAC';
export type ReservationStatus = 'NA_CEKANJU' | 'POTVRDJENA' | 'OTKAZANA';
export type DiscountType = 'NONE' | 'MANUAL' | 'DYNAMIC';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  bio: string | null;
  role: Role;
  avatarKey: string | null;
  dietary: string[];
  allergies: string[];
  settings: Record<string, unknown>;
}

export interface Market {
  id: string;
  name: string;
  city: string;
  workHours: string;
  imageKey: string | null;
  lat: number | null;
  lng: number | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  imageKey: string | null;
  sellerName: string | null;
  sellerId: string | null;
  marketId: string | null;
  market?: Market | null;
}

export interface SellerStats {
  period: string;
  totalValue: number;
  series: number[];
  labels: string[];
  top: { name: string; value: number; listingId: string | null }[];
}

export interface VoiceDraft {
  transcript: string;
  fields: { title: string; category: string; quantity: string; price: number };
}

export interface DiscountSuggestion {
  recommendedPct: number;
  reason: string;
  currentPrice: number;
  newPrice: number;
}

export interface Reservation {
  id: string;
  productId: string;
  buyerId: string;
  quantity: number;
  total: number;
  status: ReservationStatus;
  createdAt: string;
  product?: Product;
  buyer?: { name: string };
}

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: string;
  quantity: string;
  price: number;
  discount: number;
  discountType: DiscountType;
  imageUrl: string | null;
  imageKey: string | null;
  active: boolean;
  createdAt: string;
  finalPrice: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  imageKey: string | null;
  aiGenerated: boolean;
  saved: boolean;
}

export interface ReceiptItem {
  name: string;
  price: number;
}

export interface Receipt {
  id: string;
  store: string;
  date: string;
  total: number;
  items: ReceiptItem[];
  imageKey: string | null;
  createdAt: string;
}

export interface Prediction {
  id: string;
  productName: string;
  day: string;
  series: number[];
  recommended: string;
  listingId: string | null;
}

export interface Recipient {
  id: string;
  name: string;
  city: string;
  note: string | null;
  logoKey: string | null;
  lat: number | null;
  lng: number | null;
}

export interface Donation {
  id: string;
  recipientId: string;
  items: { name: string; qty: string; value?: number }[];
  estValue: number;
  createdAt: string;
  recipient?: Recipient;
}

export interface AppNotification {
  id: string;
  audience: Role;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}
