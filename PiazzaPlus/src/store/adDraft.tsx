import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export interface AdDraft {
  title: string;
  category: string;
  quantity: string;
  price: string;
  description: string;
  discountEnabled: boolean;
  /** Local image URI captured/picked on device (uploaded on submit). */
  imageUri?: string;
  /** Server URL once uploaded. */
  imageUrl?: string;
}

const EMPTY: AdDraft = {
  title: '',
  category: 'Povrće',
  quantity: '',
  price: '',
  description: '',
  discountEnabled: false,
};

interface AdDraftApi {
  draft: AdDraft;
  patch: (changes: Partial<AdDraft>) => void;
  reset: () => void;
}

const AdDraftContext = createContext<AdDraftApi | null>(null);

/** Carries the in-progress seller ad across the multi-screen create/edit flow. */
export function AdDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<AdDraft>(EMPTY);

  const value = useMemo<AdDraftApi>(
    () => ({
      draft,
      patch: (changes) => setDraft((d) => ({ ...d, ...changes })),
      reset: () => setDraft(EMPTY),
    }),
    [draft]
  );

  return <AdDraftContext.Provider value={value}>{children}</AdDraftContext.Provider>;
}

export function useAdDraft(): AdDraftApi {
  const ctx = useContext(AdDraftContext);
  if (!ctx) throw new Error('useAdDraft must be used within AdDraftProvider');
  return ctx;
}
