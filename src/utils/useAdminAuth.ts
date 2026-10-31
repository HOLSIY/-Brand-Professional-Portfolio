import { useState, useEffect, useCallback } from "react";

export interface AdminAuthState {
  isAdmin: boolean;
  adminToken: string | null;
  checkAuth: () => Promise<boolean>;
  logout: () => void;
}

// In-memory state (strictly unauthenticated by default)
let cachedToken: string | null = null;
let isVerifiedAdmin = false;

export function useAdminAuth(): AdminAuthState {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const checkAuth = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("admin_auth_token");
    if (!token) {
      isVerifiedAdmin = false;
      cachedToken = null;
      setIsAdmin(false);
      setAdminToken(null);
      return false;
    }

    try {
      const res = await fetch("/api/auth/verify-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": token,
        },
        body: JSON.stringify({ password: token }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          isVerifiedAdmin = true;
          cachedToken = token;
          setIsAdmin(true);
          setAdminToken(token);
          return true;
        }
      }
    } catch (e) {
      console.warn("Auth verification error:", e);
    }

    // If verification failed
    localStorage.removeItem("admin_auth_token");
    isVerifiedAdmin = false;
    cachedToken = null;
    setIsAdmin(false);
    setAdminToken(null);
    return false;
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_auth_token");
      localStorage.removeItem("admin_password");
      window.dispatchEvent(new Event("admin-auth-change"));
    }
    isVerifiedAdmin = false;
    cachedToken = null;
    setIsAdmin(false);
    setAdminToken(null);
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_auth_token") : null;
      if (token) {
        checkAuth();
      } else {
        isVerifiedAdmin = false;
        cachedToken = null;
        setIsAdmin(false);
        setAdminToken(null);
      }
    };

    window.addEventListener("admin-auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("admin-auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [checkAuth]);

  return { isAdmin, adminToken, checkAuth, logout };
}
