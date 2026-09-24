'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('kisanlink-user');
    const token = localStorage.getItem('kisanlink-token');
    if (savedUser && token) setUser({ ...JSON.parse(savedUser), loggedIn: true });
  }, []);

  const updateUser = (nextUser) => {
    setUser(nextUser);
    if (nextUser?.loggedIn) localStorage.setItem('kisanlink-user', JSON.stringify(nextUser));
    else localStorage.removeItem('kisanlink-user');
  };

  const logout = () => {
    localStorage.removeItem('kisanlink-user');
    localStorage.removeItem('kisanlink-token');
    setUser(null);
  };

  const value = useMemo(() => ({ user, setUser: updateUser, logout, token: typeof window === 'undefined' ? null : localStorage.getItem('kisanlink-token') }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
