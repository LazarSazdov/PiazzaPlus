/** Typed endpoint helpers over the api() client. One function per server route. */
import { api } from './client';
import {
  AppNotification,
  Donation,
  DiscountSuggestion,
  DiscountType,
  Listing,
  Market,
  Prediction,
  Product,
  Receipt,
  ReceiptItem,
  Recipe,
  Recipient,
  Reservation,
  ReservationStatus,
  Role,
  SellerStats,
  User,
  VoiceDraft,
} from './types';

// ---- Auth ----
export const authApi = {
  register: (body: { name: string; email: string; password: string; phone?: string; role?: Role }) =>
    api<{ token: string; user: User }>('/api/auth/register', { method: 'POST', body }),
  login: (body: { email: string; password: string }) =>
    api<{ token: string; user: User }>('/api/auth/login', { method: 'POST', body }),
  me: () => api<{ user: User }>('/api/auth/me'),
  becomeSeller: () => api<{ user: User }>('/api/auth/become-seller', { method: 'POST' }),
  switchRole: () => api<{ user: User }>('/api/auth/switch-role', { method: 'POST' }),
};

// ---- Catalog ----
export const catalogApi = {
  products: (params?: { q?: string; category?: string }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set('q', params.q);
    if (params?.category) qs.set('category', params.category);
    const suffix = qs.toString() ? `?${qs}` : '';
    return api<{ products: Product[] }>(`/api/products${suffix}`);
  },
  product: (id: string) => api<{ product: Product }>(`/api/products/${id}`),
  markets: (q?: string) => api<{ markets: Market[] }>(`/api/markets${q ? `?q=${encodeURIComponent(q)}` : ''}`),
};

// ---- Reservations ----
export const reservationApi = {
  create: (body: { productId: string; quantity: number }) =>
    api<{ reservation: Reservation }>('/api/reservations', { method: 'POST', body }),
  list: () => api<{ reservations: Reservation[] }>('/api/reservations'),
  incoming: () => api<{ reservations: Reservation[] }>('/api/reservations/incoming'),
  setStatus: (id: string, status: ReservationStatus) =>
    api<{ reservation: Reservation }>(`/api/reservations/${id}/status`, { method: 'PATCH', body: { status } }),
};

// ---- Listings ----
export const listingApi = {
  list: () => api<{ listings: Listing[] }>('/api/listings'),
  get: (id: string) => api<{ listing: Listing }>(`/api/listings/${id}`),
  create: (body: Partial<Listing> & { title: string; price: number }) =>
    api<{ listing: Listing }>('/api/listings', { method: 'POST', body }),
  update: (id: string, body: Partial<Listing>) =>
    api<{ listing: Listing }>(`/api/listings/${id}`, { method: 'PUT', body }),
  setDiscount: (id: string, discount: number, discountType: DiscountType) =>
    api<{ listing: Listing }>(`/api/listings/${id}/discount`, { method: 'PATCH', body: { discount, discountType } }),
  discountSuggestion: (id: string) => api<DiscountSuggestion>(`/api/listings/${id}/discount-suggestion`),
  voiceDraft: () => api<VoiceDraft>('/api/listings/voice-draft', { method: 'POST' }),
  remove: (id: string) => api<{ ok: boolean }>(`/api/listings/${id}`, { method: 'DELETE' }),
};

// ---- Stats ----
export const statsApi = {
  get: (period: 'week' | 'month' | 'year') => api<{ stats: SellerStats }>(`/api/stats?period=${period}`),
};

// ---- Recipes ----
export const recipeApi = {
  list: (type?: 'saved' | 'ai') => api<{ recipes: Recipe[] }>(`/api/recipes${type ? `?type=${type}` : ''}`),
  get: (id: string) => api<{ recipe: Recipe }>(`/api/recipes/${id}`),
  generate: (ingredients?: string[]) =>
    api<{ recipe: Recipe }>('/api/recipes/generate', { method: 'POST', body: { ingredients } }),
  toggleSave: (id: string) => api<{ saved: boolean }>(`/api/recipes/${id}/save`, { method: 'POST' }),
};

// ---- Receipts ----
export const receiptApi = {
  list: () => api<{ receipts: Receipt[] }>('/api/receipts'),
  get: (id: string) => api<{ receipt: Receipt }>(`/api/receipts/${id}`),
  scan: () =>
    api<{ parsed: { store: string; date: string; items: ReceiptItem[]; total: number; imageKey: string } }>(
      '/api/receipts/scan',
      { method: 'POST' }
    ),
  save: (body: { store: string; date: string; items: ReceiptItem[]; total: number; imageKey?: string }) =>
    api<{ receipt: Receipt }>('/api/receipts', { method: 'POST', body }),
};

// ---- Predictions ----
export const predictionApi = {
  list: () => api<{ predictions: Prediction[] }>('/api/predictions'),
  get: (id: string) => api<{ prediction: Prediction }>(`/api/predictions/${id}`),
};

// ---- Donations ----
export const donationApi = {
  recipients: () => api<{ recipients: Recipient[] }>('/api/donations/recipients'),
  list: () => api<{ donations: Donation[] }>('/api/donations'),
  get: (id: string) => api<{ donation: Donation }>(`/api/donations/${id}`),
  create: (body: { recipientId: string; items?: { name: string; qty: string }[]; estValue?: number }) =>
    api<{ donation: Donation }>('/api/donations', { method: 'POST', body }),
  chatbot: (message: string) =>
    api<{ reply: string }>('/api/donations/chatbot', { method: 'POST', body: { message } }),
  report: () =>
    api<{ report: { period: string; count: number; totalValue: number; donations: Donation[] } }>(
      '/api/donations/report'
    ),
};

// ---- Notifications ----
export const notificationApi = {
  list: (audience: Role) => api<{ notifications: AppNotification[] }>(`/api/notifications?audience=${audience}`),
  clear: (audience: Role) => api<{ ok: boolean }>(`/api/notifications?audience=${audience}`, { method: 'DELETE' }),
};

// ---- Profile ----
export const profileApi = {
  update: (body: Partial<Pick<User, 'name' | 'phone' | 'bio' | 'dietary' | 'allergies' | 'settings'>>) =>
    api<{ user: User }>('/api/profile', { method: 'PUT', body }),
};
