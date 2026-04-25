import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  token: string | null;
  setToken: (t: string | null) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (c: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(() => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  });

  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(false);

  const setToken = (t: string | null) => {
    try {
      if (t) localStorage.setItem("token", t);
      else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch {}
    setTokenState(t);
  };

  const setSidebarCollapsed = (c: boolean) => {
    try {
      // persist sidebar state in localStorage so it survives refreshes
      localStorage.setItem("sidebar_collapsed", c ? "1" : "0");
    } catch {}
    setSidebarCollapsedState(c);
  };

  // Keep token state in sync if another tab changes localStorage
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "token") setTokenState(e.newValue);
      if (e.key === "sidebar_collapsed") setSidebarCollapsedState(e.newValue === "1");
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // read persisted sidebar state on mount
  useEffect(() => {
    try {
      const v = localStorage.getItem("sidebar_collapsed");
      if (v !== null) setSidebarCollapsedState(v === "1");
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ token, setToken, sidebarCollapsed, setSidebarCollapsed }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
