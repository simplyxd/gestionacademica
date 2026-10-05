import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { SEDES } from '@/mock/sedes';
import type { EstadoSede, Sede } from '@/mock/types';
import { validarSede, type ErroresSede, type SedeInput } from './rules';

type ResultadoGuardar = { ok: true; value: Sede } | { ok: false; errores: ErroresSede };

interface SedesStore {
  sedes: Sede[];
  /** Crea (sin `id`) o actualiza una sede aplicando las reglas de `validarSede`. */
  guardar: (input: SedeInput, id?: string) => ResultadoGuardar;
  /** Las sedes no se borran: se inactivan (y se pueden reactivar), como el resto del SGA. */
  cambiarEstado: (id: string, estado: EstadoSede) => void;
}

const SedesContext = createContext<SedesStore | null>(null);

/** Store en memoria (sin persistencia): al recargar vuelve el seed. */
export function SedesProvider({ children }: PropsWithChildren) {
  const [sedes, setSedes] = useState<Sede[]>(SEDES);

  const guardar = useCallback<SedesStore['guardar']>(
    (input, id) => {
      const errores = validarSede(input, sedes, id);
      if (Object.keys(errores).length > 0) return { ok: false, errores };

      const value: Sede = {
        id: id ?? `sede-${Date.now().toString(36)}`,
        nombre: input.nombre.trim(),
        direccion: input.direccion.trim(),
        comuna: input.comuna.trim(),
        estado: input.estado,
      };
      setSedes((actuales) => (id ? actuales.map((s) => (s.id === id ? value : s)) : [...actuales, value]));
      return { ok: true, value };
    },
    [sedes],
  );

  const cambiarEstado = useCallback<SedesStore['cambiarEstado']>((id, estado) => {
    setSedes((actuales) => actuales.map((s) => (s.id === id ? { ...s, estado } : s)));
  }, []);

  const value = useMemo(() => ({ sedes, guardar, cambiarEstado }), [sedes, guardar, cambiarEstado]);
  return <SedesContext.Provider value={value}>{children}</SedesContext.Provider>;
}

export function useSedes(): SedesStore {
  const ctx = useContext(SedesContext);
  if (!ctx) throw new Error('useSedes debe usarse dentro de SedesProvider');
  return ctx;
}
