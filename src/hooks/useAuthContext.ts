import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.context';

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
