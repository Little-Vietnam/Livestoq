"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { auth, type AuthUser } from "@/lib/auth";

type User = AuthUser | null;

interface AuthContextType {
  user: User;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  credits: number;
  addCredits: (amount: number) => void;
  consumeCredit: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
  }, []);

  const login = (username: string, password: string): boolean => {
    const success = auth.login(username, password);
    if (success) {
      setUser(auth.getCurrentUser());
    }
    return success;
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  const addCredits = (amount: number) => {
    if (!user || amount <= 0) return;
    const updated = auth.updateCredits(amount);
    if (updated) {
      setUser(updated);
    }
  };

  const consumeCredit = (): boolean => {
    const current = auth.getCurrentUser();
    if (!current || (current.credits ?? 0) < 1) {
      return false;
    }
    const updated = auth.updateCredits(-1);
    if (updated) {
      setUser(updated);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: user !== null,
        credits: user?.credits ?? 0,
        addCredits,
        consumeCredit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
