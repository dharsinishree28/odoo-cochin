import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('brightloop_user') || sessionStorage.getItem('brightloop_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('brightloop_token') || sessionStorage.getItem('brightloop_token');
  });
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Validate session against server on startup / refresh
  useEffect(() => {
    let isMounted = true;
    async function verifySession() {
      const activeToken = localStorage.getItem('brightloop_token') || sessionStorage.getItem('brightloop_token');
      if (activeToken) {
        try {
          const res = await api.getMe();
          if (isMounted && res.user) {
            setUser(res.user);
            setToken(activeToken);
            // Sync storage with authoritative server user data
            if (localStorage.getItem('brightloop_token')) {
              localStorage.setItem('brightloop_user', JSON.stringify(res.user));
            } else {
              sessionStorage.setItem('brightloop_user', JSON.stringify(res.user));
            }
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          if (isMounted) {
            handleLogoutLocally();
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      }
      if (isMounted) {
        setInitializing(false);
      }
    }

    verifySession();
    return () => { isMounted = false; };
  }, []);

  function handleLogoutLocally() {
    localStorage.removeItem('brightloop_token');
    localStorage.removeItem('brightloop_user');
    sessionStorage.removeItem('brightloop_token');
    sessionStorage.removeItem('brightloop_user');
    setToken(null);
    setUser(null);
  }

  async function login(email, password, portal, rememberMe = true) {
    setLoading(true);
    try {
      const res = await api.login({ email, password, portal });
      handleLogoutLocally();

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('brightloop_token', res.token);
      storage.setItem('brightloop_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  }

  async function register(data) {
    setLoading(true);
    try {
      const payload = {
        ...data,
        role: 'customer'
      };
      const res = await api.register(payload);
      handleLogoutLocally();
      localStorage.setItem('brightloop_token', res.token);
      localStorage.setItem('brightloop_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await api.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    handleLogoutLocally();
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
