import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { Rol } from '@/app/navigation';

export interface Funcionalidad {
  id: string;
  nombre: string;
  /** Qué perfiles pueden usarla. El administrador siempre puede. */
  permisos: Record<Rol, boolean>;
}

/** Matriz inicial (RF1): qué perfil accede a qué módulo. */
export const PERMISOS_SEED: Funcionalidad[] = [
  { id: 'usuarios', nombre: 'Gestión de usuarios (alta y baja)', permisos: { admin: true, coordinador: false, docente: false, estudiante: false } },
  { id: 'estructura', nombre: 'Estructura académica (sedes y carreras)', permisos: { admin: true, coordinador: true, docente: false, estudiante: false } },
  { id: 'oferta', nombre: 'Oferta académica y secciones', permisos: { admin: true, coordinador: true, docente: false, estudiante: false } },
  { id: 'nomina', nombre: 'Consulta de nómina de estudiantes', permisos: { admin: true, coordinador: true, docente: true, estudiante: false } },
  { id: 'inscripcion', nombre: 'Inscripción de asignaturas', permisos: { admin: false, coordinador: false, docente: false, estudiante: true } },
];

interface PermisosStore {
  matriz: Funcionalidad[];
  /** Reemplaza la matriz completa (el botón «Guardar cambios» confirma el borrador de la pantalla). */
  guardar: (matriz: Funcionalidad[]) => void;
}

const PermisosContext = createContext<PermisosStore | null>(null);

/** Store en memoria (sin persistencia): al recargar vuelve el seed. */
export function PermisosProvider({ children }: PropsWithChildren) {
  const [matriz, setMatriz] = useState<Funcionalidad[]>(PERMISOS_SEED);
  const guardar = useCallback((nueva: Funcionalidad[]) => setMatriz(nueva), []);
  const value = useMemo(() => ({ matriz, guardar }), [matriz, guardar]);
  return <PermisosContext.Provider value={value}>{children}</PermisosContext.Provider>;
}

export function usePermisos(): PermisosStore {
  const ctx = useContext(PermisosContext);
  if (!ctx) throw new Error('usePermisos debe usarse dentro de PermisosProvider');
  return ctx;
}
