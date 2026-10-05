import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { Rol } from '@/app/navigation';

export interface Usuario {
  nombre: string;
  rol: Rol;
  iniciales: string;
}

/** Usuarios mock, uno por perfil. No hay login ni API: el rol se cambia desde el menú de usuario. */
const USUARIOS: Record<Rol, Usuario> = {
  admin: { nombre: 'Andrés Valdés', rol: 'admin', iniciales: 'AV' },
  coordinador: { nombre: 'Carolina Muñoz', rol: 'coordinador', iniciales: 'CM' },
  docente: { nombre: 'Rodrigo Pardo', rol: 'docente', iniciales: 'RP' },
  estudiante: { nombre: 'Valentina Rojas', rol: 'estudiante', iniciales: 'VR' },
};

const STORAGE_KEY = 'sga.mock.rol';

function rolInicial(): Rol {
  try {
    const guardado = window.sessionStorage.getItem(STORAGE_KEY);
    if (guardado && guardado in USUARIOS) return guardado as Rol;
  } catch {
    /* sessionStorage no disponible: se usa el valor por defecto */
  }
  return 'coordinador';
}

interface AuthStore {
  usuario: Usuario;
  /** Solo prototipo: simula iniciar sesión con otro perfil. */
  cambiarRol: (rol: Rol) => void;
}

const AuthContext = createContext<AuthStore | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [rol, setRol] = useState<Rol>(rolInicial);

  const cambiarRol = useCallback((nuevo: Rol) => {
    setRol(nuevo);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, nuevo);
    } catch {
      /* sin persistencia: el cambio vale solo para esta sesión de la pestaña */
    }
  }, []);

  const value = useMemo(() => ({ usuario: USUARIOS[rol], cambiarRol }), [rol, cambiarRol]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthStore {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
