import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { authApi } from '@/api/sdk';
import { setAuthToken } from '@/api/client';
import { Role, User } from '@/api/types';

const TOKEN_KEY = 'pijaca_token';

interface AuthState {
  user: User | null;
  token: string | null;
  isSeller: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: { name: string; email: string; password: string; phone?: string }) => Promise<User>;
  logout: () => Promise<void>;
  becomeSeller: () => Promise<User>;
  switchRole: () => Promise<User>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthState | null>(null);

async function persistToken(token: string | null) {
  try {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // SecureStore can be unavailable on web; non-fatal for the demo.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  const applySession = useCallback((nextToken: string, nextUser: User) => {
    setAuthToken(nextToken);
    setTokenState(nextToken);
    setUserState(nextUser);
    void persistToken(nextToken);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { token: t, user: u } = await authApi.login({ email, password });
      applySession(t, u);
      return u;
    },
    [applySession]
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string; phone?: string }) => {
      const { token: t, user: u } = await authApi.register(input);
      applySession(t, u);
      return u;
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    setAuthToken(null);
    setTokenState(null);
    setUserState(null);
    await persistToken(null);
  }, []);

  const becomeSeller = useCallback(async () => {
    const { user: u } = await authApi.becomeSeller();
    setUserState(u);
    return u;
  }, []);

  const switchRole = useCallback(async () => {
    const { user: u } = await authApi.switchRole();
    setUserState(u);
    return u;
  }, []);

  const setUser = useCallback((u: User) => setUserState(u), []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      token,
      isSeller: user?.role === 'PRODAVAC',
      login,
      register,
      logout,
      becomeSeller,
      switchRole,
      setUser,
    }),
    [user, token, login, register, logout, becomeSeller, switchRole, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export type { Role };
