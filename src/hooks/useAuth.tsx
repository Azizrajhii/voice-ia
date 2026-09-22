import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  clearToken,
  getCurrentUser,
  getToken,
  loginAccount,
  registerAccount,
  setToken,
  type PublicUser,
} from "@/lib/api";

type AuthValue = {
  user: PublicUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateUser: (user: PublicUser) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    getCurrentUser()
      .then(({ user: current }) => setUser(current))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user: signedInUser } = await loginAccount(email, password);
    setToken(token);
    setUser(signedInUser);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const { token, user: newUser } = await registerAccount(name, email, password);
    setToken(token);
    setUser(newUser);
  }, []);

  const signOut = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUser: setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
