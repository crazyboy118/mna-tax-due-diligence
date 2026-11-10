import { createContext, useContext, useState } from 'react';
import api from './api';

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const save = (u) => { localStorage.setItem('user', JSON.stringify(u)); setUser(u); };

  const login = async (email, password) => save((await api.post('/auth/login', { email, password })).data);
  const register = async (name, email, password) =>
    save((await api.post('/auth/register', { name, email, password })).data);
  const logout = () => { localStorage.removeItem('user'); setUser(null); };
  const canEdit = !!user && ['admin', 'lead_analyst'].includes(user.role);

  return <Ctx.Provider value={{ user, login, register, logout, canEdit }}>{children}</Ctx.Provider>;
}
