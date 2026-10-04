import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useInscripciones } from '@/features/inscripcion/useInscripciones';
import type { Escenario } from '@/features/inscripcion/reglas';
import { construirFilas } from '@/features/oferta/useOferta';

type SgaValue = ReturnType<typeof useInscripciones> & {
  filas: ReturnType<typeof construirFilas>;
  escenario: Escenario;
  setEscenario: (e: Escenario) => void;
};

const SgaContext = createContext<SgaValue | null>(null);

export function SgaProvider({ children }: { children: ReactNode }) {
  const inscripciones = useInscripciones();
  const [escenario, setEscenario] = useState<Escenario>('normal');

  const filas = useMemo(
    () => construirFilas(inscripciones.ocupacionDe, inscripciones.estaInscrita),
    [inscripciones.ocupacionDe, inscripciones.estaInscrita],
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
