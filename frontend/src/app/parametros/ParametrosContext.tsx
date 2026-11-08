import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  PARAMETROS_DEFAULT,
  type ParametrosInstitucionales,
} from '@/mocks/parametros';

const STORAGE_KEY = 'sga-parametros-institucionales-v1';

function readStored(): ParametrosInstitucionales {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return PARAMETROS_DEFAULT;
    return { ...PARAMETROS_DEFAULT, ...JSON.parse(raw) } as ParametrosInstitucionales;
  } catch {
    return PARAMETROS_DEFAULT;
  }
}

interface ParametrosContextValue {
  parametros: ParametrosInstitucionales;
  setParametros: (next: ParametrosInstitucionales) => void;
  updateCampo: <K extends keyof ParametrosInstitucionales>(
    key: K,
    value: ParametrosInstitucionales[K],
  ) => void;
  restablecer: () => void;
  guardar: () => void;
  dirty: boolean;
}

const ParametrosContext = createContext<ParametrosContextValue | null>(null);

export function ParametrosProvider({ children }: { children: ReactNode }) {
  const [parametros, setParametrosState] = useState<ParametrosInstitucionales>(() => readStored());
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(readStored()));

  const setParametros = useCallback((next: ParametrosInstitucionales) => {
    setParametrosState(next);
  }, []);

  const updateCampo = useCallback(
    <K extends keyof ParametrosInstitucionales>(key: K, value: ParametrosInstitucionales[K]) => {
      setParametrosState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const guardar = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parametros));
    setSavedSnapshot(JSON.stringify(parametros));
  }, [parametros]);

  const restablecer = useCallback(() => {
    setParametrosState(PARAMETROS_DEFAULT);
    localStorage.removeItem(STORAGE_KEY);
    setSavedSnapshot(JSON.stringify(PARAMETROS_DEFAULT));
  }, []);

  const dirty = JSON.stringify(parametros) !== savedSnapshot;

  const value = useMemo(
    () => ({
      parametros,
      setParametros,
      updateCampo,
      restablecer,
      guardar,
      dirty,
    }),
    [parametros, setParametros, updateCampo, restablecer, guardar, dirty],
  );

  return <ParametrosContext.Provider value={value}>{children}</ParametrosContext.Provider>;
}

export function useParametros() {
  const ctx = useContext(ParametrosContext);
  if (!ctx) throw new Error('useParametros debe usarse dentro de ParametrosProvider');
  return ctx;
}
