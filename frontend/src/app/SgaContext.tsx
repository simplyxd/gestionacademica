import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useInscripciones } from '@/features/inscripcion/useInscripciones';
import type { Escenario } from '@/features/inscripcion/reglas';
import { useOfertaStore } from '@/features/oferta/OfertaContext';
import { construirFilas } from '@/features/oferta/useOferta';
import { usePeriodos } from '@/features/periodos/PeriodosContext';

type SgaValue = ReturnType<typeof useInscripciones> & {
  filas: ReturnType<typeof construirFilas>;
  escenario: Escenario;
  setEscenario: (e: Escenario) => void;
};

const SgaContext = createContext<SgaValue | null>(null);

export function SgaProvider({ children }: { children: ReactNode }) {
  const { secciones } = useOfertaStore();
  const { periodoActual } = usePeriodos();
  // El estudiante ve la oferta del período en curso: la que programa el coordinador.
  const vigentes = useMemo(
    () => secciones.filter((s) => s.periodoId === (periodoActual?.id ?? '')),
    [secciones, periodoActual],
  );
  // Las inscripciones se resuelven contra todas las secciones, por si una cambia de período.
  const inscripciones = useInscripciones(secciones);
  const [escenario, setEscenario] = useState<Escenario>('normal');

  const filas = useMemo(
    () => construirFilas(vigentes, inscripciones.ocupacionDe, inscripciones.estaInscrita),
    [vigentes, inscripciones.ocupacionDe, inscripciones.estaInscrita],
  );

  const value = useMemo(
    () => ({ ...inscripciones, filas, escenario, setEscenario }),
    [inscripciones, filas, escenario],
  );

  return <SgaContext.Provider value={value}>{children}</SgaContext.Provider>;
}

export function useSga() {
  const ctx = useContext(SgaContext);
  if (!ctx) throw new Error('useSga debe usarse dentro de SgaProvider');
  return ctx;
}
