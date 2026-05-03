"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

type User = { username: string } | null;

type AuthCtx = {
  user: User;
  setUser: (u: User) => void;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

const STORAGE_KEY = "mhn_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUserState(JSON.parse(raw));
    } catch {}
  }, []);

  const setUser = useCallback((u: User) => {
    setUserState(u);
    try {
      if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  return (
    <Ctx.Provider value={{ user, setUser, loginOpen, openLogin, closeLogin }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}
