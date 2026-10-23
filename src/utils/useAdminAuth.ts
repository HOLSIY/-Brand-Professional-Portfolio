import { useState, useEffect, useCallback } from "react";

export interface AdminAuthState {
  isAdmin: boolean;
  adminToken: string | null;
  checkAuth: () => Promise<boolean>;
  logout: () => void;
}

// In-memory cache for fast synchronous checks
let cachedToken: string | null = typeof window !== "undefined" ? localStorage.getItem("admin_auth_token") : null;
let isVerifiedAdmin = false;

export function useAdminAuth(): AdminAuthState {
  const [isAdmin, setIsAdmin] = useState<boolean>(isVerifiedAdmin);
  const [adminToken, setAdminToken] = useState<string | null>(cachedToken);

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
      // Network failure; retain local token if already verified, else false
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
    // Initial verification if token exists
    const currentToken = localStorage.getItem("admin_auth_token");
    if (currentToken) {
      checkAuth();
    } else {
      setIsAdmin(false);
      setAdminToken(null);
    }

    const handleAuthChange = () => {
      const token = localStorage.getItem("admin_auth_token");
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
