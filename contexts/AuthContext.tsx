'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setRememberMe: (value: boolean) => void;
  rememberMe: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setRememberMe: () => {},
  rememberMe: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // Verificar si hay preferencia guardada
    const savedPreference = Cookies.get('remember-me');
    if (savedPreference === 'true') {
      setRememberMe(true);
    }

    // Configurar persistencia basada en rememberMe
    const setupPersistence = async () => {
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
    };
    
    setupPersistence();

    // Escuchar cambios en la autenticación
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [rememberMe]);

  return (
    <AuthContext.Provider value={{ user, loading, setRememberMe, rememberMe }}>
      {children}
    </AuthContext.Provider>
  );
}