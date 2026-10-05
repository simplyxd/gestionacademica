import { createContext, useCallback, useContext, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { MATRICULAS_SEED } from '@/mock/matriculas';
import { useEstructura } from '@/features/estructura/EstructuraContext';
import { cambiarEstado, registrarMatricula } from './rules';
import type { EstadoMatricula, Matricula, NuevaMatricula, Resultado } from './types';

interface MatriculaStore {
  matriculas: Matricula[];
  registrar: (input: NuevaMatricula) => Resultado<Matricula>;
  cambiarEstado: (id: string, nuevo: EstadoMatricula) => Resultado<Matricula>;
}

const MatriculaContext = createContext<MatriculaStore | null>(null);

/**
 * Store en memoria (sin persistencia): al recargar vuelve el seed.
 * Se lee desde un ref para que dos envíos seguidos vean siempre el estado más reciente
 * y la regla «una vigente por período» no dependa de cuándo React re-renderice.
 */
export function MatriculaProvider({ children }: PropsWithChildren) {
  const { planes } = useEstructura();
  const [matriculas, setMatriculas] = useState<Matricula[]>(MATRICULAS_SEED);
  const ref = useRef(matriculas);
  const secuencia = useRef(MATRICULAS_SEED.length);

  const commit = useCallback((next: Matricula[]) => {
    ref.current = next;
    setMatriculas(next);
  }, []);

  const registrar = useCallback<MatriculaStore['registrar']>(
    (input) => {
      const id = `MAT-${String(secuencia.current + 1).padStart(4, '0')}`;
      const r = registrarMatricula(ref.current, input, planes, { id, ahora: new Date().toISOString() });
      if (r.ok) {
        secuencia.current += 1;
        commit([r.value, ...ref.current]);
      }
      return r;
    },
    [commit, planes],
  );

  const cambiar = useCallback<MatriculaStore['cambiarEstado']>(
    (id, nuevo) => {
      const r = cambiarEstado(ref.current, id, nuevo);
      if (!r.ok) return r;
      commit(r.value);
      return { ok: true, value: r.value.find((m) => m.id === id)! };
    },
    [commit],
  );

  const value = useMemo(
    () => ({ matriculas, registrar, cambiarEstado: cambiar }),
    [matriculas, registrar, cambiar],
  );

  return <MatriculaContext.Provider value={value}>{children}</MatriculaContext.Provider>;
}

export function useMatriculas(): MatriculaStore {
  const ctx = useContext(MatriculaContext);
  if (!ctx) throw new Error('useMatriculas debe usarse dentro de <MatriculaProvider>');
  return ctx;
}
