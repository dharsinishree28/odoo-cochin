import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('brightloop_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('brightloop_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('brightloop_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('brightloop_user');
    }
  }, [user]);

  async function login(email, password, rememberMe = true) {
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('brightloop_token', res.token);
      localStorage.setItem('brightloop_user', JSON.stringify(res.user));
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
      // Public registration is strictly customer role
      const payload = {
        ...data,
        role: 'customer'
      };
      const res = await api.register(payload);
      localStorage.setItem('brightloop_token', res.token);
      localStorage.setItem('brightloop_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('brightloop_token');
    localStorage.removeItem('brightloop_user');
    sessionStorage.removeItem('brightloop_token');
    setToken(null);
    setUser(null);
  }

  // Quick switch for reviewer convenience
  async function quickSwitch(role) {
    const creds = {
      admin: { email: 'carlic@gmail.com', pw: 'Password@123' },
      staff: { email: 'sarah.sales@brightloop.com', pw: 'Staff@1234' },
      customer: { email: 'anna.jones@acmecorp.com', pw: 'Customer@123' }
    }[role];

    if (creds) {
      return await login(creds.email, creds.pw, true);
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, quickSwitch }}>
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
