import { useState, useCallback } from "react";

interface AdminUser {
  username: string;
  isStaff: boolean;
}

interface UseAdminAuthReturn {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("admin_token");
  });
  const [user, setUser] = useState<AdminUser | null>(() => {
    const userJson = localStorage.getItem("admin_user");
    return userJson ? JSON.parse(userJson) : null;
  });

  const login = useCallback((newToken: string, newUser: AdminUser) => {
    localStorage.setItem("admin_token", newToken);
    localStorage.setItem("admin_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setToken(null);
    setUser(null);
  }, []);

  // Token validation happens automatically on API calls
  // If a 401 is received, the user is redirected to login

  return {
    token,
    user,
    isAuthenticated: !!token && !!user,
    login,
    logout,
  };
}
