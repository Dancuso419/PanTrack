import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import api from "../services/api";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    await api.post("/auth/login", { email, password });
    const me = await api.get("/auth/me");
    setUser(me.data.data);
  }

  async function register(fullName: string, email: string, password: string) {
    await api.post("/auth/register", { fullName, email, password });
    const me = await api.get("/auth/me");
    setUser(me.data.data);
  }

  async function logout() {
    await api.post("/auth/logout");
    setUser(null);
  }

  function updateUser(data: Partial<User>) {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
