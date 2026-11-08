import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { Rol } from '@/app/navigation';

export interface Usuario {
  nombre: string;
  rol: Rol;
  iniciales: string;
}

/**
 * Usuarios mock, uno por perfil. El login es simulado (cualquier correo válido y contraseña no vacía
 * entran) y no hay API: el rol se sigue cambiando desde el menú de usuario.
 */
const USUARIOS: Record<Rol, Usuario> = {
  admin: { nombre: 'Andrés Valdés', rol: 'admin', iniciales: 'AV' },
  coordinador: { nombre: 'Carolina Muñoz', rol: 'coordinador', iniciales: 'CM' },
  docente: { nombre: 'Rodrigo Fuentes', rol: 'docente', iniciales: 'RF' },
  estudiante: { nombre: 'Valentina Rojas', rol: 'estudiante', iniciales: 'VR' },
};

const STORAGE_KEY = 'sga.mock.rol';
const SESION_KEY = 'sga.mock.sesion';

/** Sesión mock: solo el correo. La contraseña nunca se guarda. */
export interface Sesion {
  correo: string;
}

function rolInicial(): Rol {
  try {
    const guardado = window.sessionStorage.getItem(STORAGE_KEY);
    if (guardado && guardado in USUARIOS) return guardado as Rol;
  } catch {
    /* sessionStorage no disponible: se usa el valor por defecto */
  }
  return 'coordinador';
}

function sesionInicial(): Sesion | null {
  try {
    const correo = window.sessionStorage.getItem(SESION_KEY);
    if (correo) return { correo };
  } catch {
    /* sessionStorage no disponible: se parte sin sesión */
  }
  return null;
}

interface AuthStore {
  usuario: Usuario;
  /** Solo prototipo: simula iniciar sesión con otro perfil. */
  cambiarRol: (rol: Rol) => void;
  sesion: Sesion | null;
  /** Mock: no valida credenciales; el SGA real autentica en el backend (JWT). */
  iniciarSesion: (correo: string) => void;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthStore | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [rol, setRol] = useState<Rol>(rolInicial);
  const [sesion, setSesion] = useState<Sesion | null>(sesionInicial);

  const cambiarRol = useCallback((nuevo: Rol) => {
    setRol(nuevo);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, nuevo);
    } catch {
      /* sin persistencia: el cambio vale solo para esta sesión de la pestaña */
    }
  }, []);

  const iniciarSesion = useCallback((correo: string) => {
    setSesion({ correo });
    try {
      window.sessionStorage.setItem(SESION_KEY, correo);
    } catch {
      /* sin persistencia: la sesión se pierde al recargar */
    }
  }, []);

  const cerrarSesion = useCallback(() => {
    setSesion(null);
    try {
      window.sessionStorage.removeItem(SESION_KEY);
    } catch {
      /* sessionStorage no disponible: basta con limpiar el estado */
    }
  }, []);

  const value = useMemo(
    () => ({ usuario: USUARIOS[rol], cambiarRol, sesion, iniciarSesion, cerrarSesion }),
    [rol, cambiarRol, sesion, iniciarSesion, cerrarSesion],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthStore {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
