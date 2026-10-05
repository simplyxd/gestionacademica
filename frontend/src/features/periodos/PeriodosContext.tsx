import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { PERIODOS } from '@/mock/estructura';
import type { Periodo } from '@/mock/types';
import { periodoDesdeInput, validarPeriodo, type ErroresPeriodo, type PeriodoInput } from './rules';

type ResultadoGuardar = { ok: true; value: Periodo } | { ok: false; errores: ErroresPeriodo };

interface PeriodosStore {
  periodos: Periodo[];
  /** Período «en curso»: el que muestra el Header (solo uno a la vez). */
  periodoActual: Periodo | undefined;
  /** Crea (sin `id`) o actualiza un período aplicando las reglas de `validarPeriodo`. */
  guardar: (input: PeriodoInput, id?: string) => ResultadoGuardar;
}

const PeriodosContext = createContext<PeriodosStore | null>(null);

/** Store en memoria (sin persistencia): al recargar vuelve el seed. */
export function PeriodosProvider({ children }: PropsWithChildren) {
  const [periodos, setPeriodos] = useState<Periodo[]>(PERIODOS);

  const guardar = useCallback<PeriodosStore['guardar']>(
    (input, id) => {
      const errores = validarPeriodo(input, periodos, id);
      if (Object.keys(errores).length > 0) return { ok: false, errores };

      const value = periodoDesdeInput(input, id ?? `per-${input.codigo.trim()}`);
      setPeriodos((actuales) =>
        id ? actuales.map((p) => (p.id === id ? value : p)) : [...actuales, value],
      );
      return { ok: true, value };
    },
    [periodos],
  );

  const value = useMemo(
    () => ({ periodos, periodoActual: periodos.find((p) => p.estado === 'en curso'), guardar }),
    [periodos, guardar],
  );

  return <PeriodosContext.Provider value={value}>{children}</PeriodosContext.Provider>;
}

export function usePeriodos(): PeriodosStore {
  const ctx = useContext(PeriodosContext);
  if (!ctx) throw new Error('usePeriodos debe usarse dentro de PeriodosProvider');
  return ctx;
}
