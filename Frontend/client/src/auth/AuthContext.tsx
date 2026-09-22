import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User, UserRole } from "@/types";
import api, { setToken, clearToken } from "@/lib/api";

const STORAGE_KEY = "expenseTrackerUser";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadUser(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as User;
  } catch {
    /* corrupted storage – treat as logged-out */
  }
  return null;
}

function persistUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);

  // Keep localStorage in sync when user changes
  useEffect(() => {
    persistUser(user);
  }, [user]);

  const login = useCallback(async (email: string, password: string): Promise<User | null> => {
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        const { token, user: authedUser } = res.data.data;
        setToken(token);
        setUser(authedUser);
        return authedUser;
      }
      return null;
    } catch (err: any) {
      console.error("Login failed:", err?.response?.data?.error?.message || err.message);
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearToken();
    persistUser(null);
    // Optionally call the backend logout endpoint (fire-and-forget)
    api.post("/auth/logout").catch(() => {});
  }, []);

  const value: AuthContextType = {
    user,
    role: user?.role ?? null,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
