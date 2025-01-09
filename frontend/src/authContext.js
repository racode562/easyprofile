import React, { createContext, useState, useEffect } from "react";
import api from "./api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, call /api/auth/me. If cookie is valid, we get user data; otherwise, user is null.
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const res = await api.get("/api/auth/me");
        if (isMounted) {
          setUser({ username: res.data.username });
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
          // Don't redirect on initial auth check
          if (error.response?.status !== 401) {
            console.error('Auth check failed:', error);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (username, password) => {
    await api.post("/api/auth/login", { username, password });
    // If successful, the cookie is set by the server (HttpOnly).
    // Let's fetch user data now to update context.
    const res = await api.get("/api/auth/me");
    setUser({ username: res.data.username });
  };

  const logout = async () => {
    await api.post("/api/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
