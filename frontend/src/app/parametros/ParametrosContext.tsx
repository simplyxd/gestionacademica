import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  PARAMETROS_DEFAULT,
  type ParametrosInstitucionales,
} from '@/mocks/parametros';
import { esTokenDemo } from '@/mocks/demoUsuarios';
import { api, ApiError, type RespuestaItem } from '@/lib/api';
import { session } from '@/lib/session';
import { escucharSesionInvalida } from '@/lib/sesionInvalida';

const CAMPOS = Object.keys(PARAMETROS_DEFAULT) as (keyof ParametrosInstitucionales)[];

/** Mismo código que backend/src/errors/codigos/parametros.js. El 404 de ruta usa otro código. */
const CODIGO_NO_ENCONTRADO = 'PAR_NO_ENCONTRADO';

export type EstadoParametros = 'cargando' | 'listo' | 'vacio' | 'error';

/**
 * Aplica solo los campos que vinieron. Si el GET público no trae nombreCorto,
 * el encabezado sigue leyendo nombreInstitucion y siglasPortal (los que sí vienen, o el valor previo).
 */
export function aplicarParametrosRecibidos(
  base: ParametrosInstitucionales,
  recibidos: Partial<ParametrosInstitucionales>,
): ParametrosInstitucionales {
  const next: ParametrosInstitucionales = { ...base };
  for (const campo of CAMPOS) {
    const valor = recibidos[campo];
    if (valor !== undefined) asignar(next, campo, valor);
  }
  return next;
}

function asignar<K extends keyof ParametrosInstitucionales>(
  destino: ParametrosInstitucionales,
  campo: K,
  valor: ParametrosInstitucionales[K],
) {
  destino[campo] = valor;
}

function conservarPublico(prev: ParametrosInstitucionales): ParametrosInstitucionales {
  return aplicarParametrosRecibidos(PARAMETROS_DEFAULT, {
    nombreInstitucion: prev.nombreInstitucion,
    siglasPortal: prev.siglasPortal,
    duracionSesionMinutos: prev.duracionSesionMinutos,
  });
}

function esAbort(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AbortError';
}

interface ParametrosContextValue {
  parametros: ParametrosInstitucionales;
  estado: EstadoParametros;
  error: string | null;
  errorGuardado: string | null;
  cargando: boolean;
  guardando: boolean;
  dirty: boolean;
  setParametros: (next: ParametrosInstitucionales) => void;
  updateCampo: <K extends keyof ParametrosInstitucionales>(
    key: K,
    value: ParametrosInstitucionales[K],
  ) => void;
  restablecer: () => void;
  guardar: () => Promise<boolean>;
  recargar: () => void;
}

const ParametrosContext = createContext<ParametrosContextValue | null>(null);

const MENSAJE_SIN_SESION = 'Inicia sesión para ver los parámetros institucionales.';
const MENSAJE_CARGA = 'No se pudieron cargar los parámetros. Inténtalo de nuevo.';
const MENSAJE_GUARDADO = 'No se pudieron guardar los parámetros. Inténtalo de nuevo.';

export function ParametrosProvider({ children }: { children: ReactNode }) {
  const [parametros, setParametrosState] = useState<ParametrosInstitucionales>(PARAMETROS_DEFAULT);
  const [guardado, setGuardado] = useState(() => JSON.stringify(PARAMETROS_DEFAULT));
  const [estado, setEstado] = useState<EstadoParametros>('cargando');
  const [error, setError] = useState<string | null>(null);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const cargaId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const parametrosRef = useRef(parametros);
  parametrosRef.current = parametros;

  const publicar = useCallback((next: ParametrosInstitucionales) => {
    setParametrosState(next);
    setGuardado(JSON.stringify(next));
  }, []);

  const cargar = useCallback(async () => {
    abortRef.current?.abort();
    const control = new AbortController();
    abortRef.current = control;
    const id = ++cargaId.current;

    if (!session.getToken()) {
      if (id !== cargaId.current) return;
      publicar(conservarPublico(parametrosRef.current));
      setEstado('error');
      setError(MENSAJE_SIN_SESION);
      setCargando(false);
      return;
    }

    // Demo de períodos/inscripción: usa los parámetros mock, sin llamar a la API.
    if (esTokenDemo(session.getToken())) {
      if (id !== cargaId.current) return;
      publicar({ ...PARAMETROS_DEFAULT });
      setEstado('listo');
      setError(null);
      setCargando(false);
      return;
    }

    setCargando(true);
    try {
      const { data } = await api.get<RespuestaItem<Partial<ParametrosInstitucionales>>>('/parametros', {
        senal: control.signal,
      });
      if (id !== cargaId.current) return;
      publicar(aplicarParametrosRecibidos(PARAMETROS_DEFAULT, data ?? {}));
      setEstado('listo');
      setError(null);
    } catch (causa) {
      if (esAbort(causa) || id !== cargaId.current) return;
      if (causa instanceof ApiError && causa.code === CODIGO_NO_ENCONTRADO) {
        publicar({ ...PARAMETROS_DEFAULT });
        setEstado('vacio');
        setError(null);
        return;
      }
      setEstado('error');
      setError(causa instanceof ApiError ? causa.message : MENSAJE_CARGA);
    } finally {
      if (id === cargaId.current && !control.signal.aborted) setCargando(false);
    }
  }, [publicar]);

  useEffect(() => {
    void cargar();
    let previo = session.getToken();
    const id = window.setInterval(() => {
      const actual = session.getToken();
      if (actual !== previo) {
        previo = actual;
        void cargar();
      }
    }, 1000);
    return () => {
      window.clearInterval(id);
      abortRef.current?.abort();
    };
  }, [cargar]);

  useEffect(
    () =>
      escucharSesionInvalida(() => {
        publicar(conservarPublico(parametrosRef.current));
        setEstado('error');
        setError('Tu sesión venció. Inicia sesión de nuevo para ver los parámetros.');
        setCargando(false);
      }),
    [publicar],
  );

  const setParametros = useCallback((next: ParametrosInstitucionales) => {
    setParametrosState(next);
  }, []);

  const updateCampo = useCallback(
    <K extends keyof ParametrosInstitucionales>(key: K, value: ParametrosInstitucionales[K]) => {
      setParametrosState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const guardar = useCallback(async () => {
    setGuardando(true);
    setErrorGuardado(null);
    try {
      const { data } = await api.put<RespuestaItem<Partial<ParametrosInstitucionales>>>('/parametros', parametros);
      publicar(aplicarParametrosRecibidos(PARAMETROS_DEFAULT, data ?? {}));
      setEstado('listo');
      setError(null);
      return true;
    } catch (causa) {
      setErrorGuardado(causa instanceof ApiError ? causa.message : MENSAJE_GUARDADO);
      return false;
    } finally {
      setGuardando(false);
    }
  }, [parametros, publicar]);

  const restablecer = useCallback(() => {
    setParametrosState(JSON.parse(guardado) as ParametrosInstitucionales);
    setErrorGuardado(null);
  }, [guardado]);

  const recargar = useCallback(() => {
    void cargar();
  }, [cargar]);

  const dirty = JSON.stringify(parametros) !== guardado;

  const value = useMemo(
    () => ({
      parametros,
      estado,
      error,
      errorGuardado,
      cargando,
      guardando,
      dirty,
      setParametros,
      updateCampo,
      restablecer,
      guardar,
      recargar,
    }),
    [
      parametros,
      estado,
      error,
      errorGuardado,
      cargando,
      guardando,
      dirty,
      setParametros,
      updateCampo,
      restablecer,
      guardar,
      recargar,
    ],
  );

  return <ParametrosContext.Provider value={value}>{children}</ParametrosContext.Provider>;
}

export function useParametros() {
  const ctx = useContext(ParametrosContext);
  if (!ctx) throw new Error('useParametros debe usarse dentro de ParametrosProvider');
  return ctx;
}
