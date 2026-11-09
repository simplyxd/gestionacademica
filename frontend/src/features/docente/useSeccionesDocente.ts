import { useCallback, useEffect, useState } from 'react';
import { ApiError, api, type RespuestaItem, type RespuestaLista } from '@/lib/api';
import type { BloqueHorarioDocente, InscritoNomina, PeriodoDocente, SeccionDocente } from './types';

function mensajeDe(causa: unknown): string {
  if (causa instanceof ApiError) return causa.message;
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}

function exigirLista<T>(data: unknown, que: string): T[] {
  if (!Array.isArray(data)) {
    throw new ApiError({
      status: 200,
      code: 'GEN_RESPUESTA_INVALIDA',
      message: `No se pudo interpretar ${que}.`,
    });
  }
  return data as T[];
}

/**
 * Pide datos al API y distingue cargando, error y resultado.
 * `clave` cambia cuando cambian los parámetros: así se vuelve a pedir y no se muestra lo anterior.
 */
function esAbort(causa: unknown): boolean {
  return typeof causa === 'object' && causa !== null && (causa as { name?: string }).name === 'AbortError';
}

function usePeticion<T>(activo: boolean, clave: string, pedir: (senal: AbortSignal) => Promise<T>) {
  const [recarga, setRecarga] = useState(0);
  const claveActual = activo ? `${clave}|${recarga}` : '';
  const [resultado, setResultado] = useState<{ clave: string; datos: T | null; error: string | null } | null>(null);

  useEffect(() => {
    if (!activo) return undefined;
    const control = new AbortController();
    pedir(control.signal)
      .then((datos) => {
        if (control.signal.aborted) return;
        setResultado({ clave: claveActual, datos, error: null });
      })
      .catch((causa: unknown) => {
        if (control.signal.aborted || esAbort(causa)) return;
        setResultado({ clave: claveActual, datos: null, error: mensajeDe(causa) });
      });
    return () => control.abort();
  }, [activo, claveActual, pedir]);

  const cargando = activo && resultado?.clave !== claveActual;
  return {
    datos: cargando ? null : (resultado?.datos ?? null),
    cargando,
    error: cargando ? null : (resultado?.error ?? null),
    recargar: () => setRecarga((n) => n + 1),
  };
}

function usePeriodosDocente() {
  const pedir = useCallback(
    (senal: AbortSignal) =>
      api
        .get<RespuestaLista<PeriodoDocente>>('/periodos', { query: { limit: 100 }, senal })
        .then((respuesta) => exigirLista<PeriodoDocente>(respuesta.data, 'la lista de períodos')),
    [],
  );
  const consulta = usePeticion(true, 'periodos', pedir);
  const periodos = consulta.datos ?? [];
  const [elegido, setElegido] = useState('');
  const periodoId =
    elegido && periodos.some((periodo) => periodo.id === elegido)
      ? elegido
      : (periodos.find((periodo) => periodo.estado === 'en_curso')?.id ?? periodos[0]?.id ?? '');

  return {
    periodos,
    periodoId,
    setPeriodoId: setElegido,
    periodo: periodos.find((periodo) => periodo.id === periodoId) ?? null,
    cargandoPeriodos: consulta.cargando,
    errorPeriodos: consulta.error,
    recargarPeriodos: consulta.recargar,
  };
}

/** Secciones del docente con sesión. El id no se envía: lo toma el backend del token. */
export function useSeccionesDocente() {
  const periodos = usePeriodosDocente();
  const { periodoId, cargandoPeriodos, errorPeriodos } = periodos;
  const listo = Boolean(periodoId) && !cargandoPeriodos && !errorPeriodos;
  const pedir = useCallback(
    (senal: AbortSignal) =>
      api
        .get<RespuestaItem<SeccionDocente[]>>('/docente/secciones', { query: { periodoId }, senal })
        .then((respuesta) => exigirLista<SeccionDocente>(respuesta.data, 'tus secciones')),
    [periodoId],
  );
  const consulta = usePeticion(listo, periodoId, pedir);

  return {
    ...periodos,
    secciones: consulta.datos ?? [],
    cargandoSecciones: consulta.cargando,
    errorSecciones: consulta.error,
    recargarSecciones: consulta.recargar,
  };
}

/** Bloques del horario del docente con sesión, del período elegido. */
export function useHorarioDocente() {
  const periodos = usePeriodosDocente();
  const { periodoId, cargandoPeriodos, errorPeriodos } = periodos;
  const listo = Boolean(periodoId) && !cargandoPeriodos && !errorPeriodos;
  const pedir = useCallback(
    (senal: AbortSignal) =>
      api
        .get<RespuestaItem<BloqueHorarioDocente[]>>('/docente/horario', { query: { periodoId }, senal })
        .then((respuesta) => exigirLista<BloqueHorarioDocente>(respuesta.data, 'tu horario')),
    [periodoId],
  );
  const consulta = usePeticion(listo, periodoId, pedir);

  return {
    ...periodos,
    bloques: consulta.datos ?? [],
    cargandoHorario: consulta.cargando,
    errorHorario: consulta.error,
    recargarHorario: consulta.recargar,
  };
}

/** Nómina de una sección propia. Sin seccionId no pide nada. */
export function useNomina(seccionId: string | null) {
  const pedir = useCallback(
    (senal: AbortSignal) =>
      api
        .get<RespuestaItem<InscritoNomina[]>>(`/docente/secciones/${seccionId}/nomina`, { senal })
        .then((respuesta) => exigirLista<InscritoNomina>(respuesta.data, 'la nómina')),
    [seccionId],
  );
  return usePeticion(Boolean(seccionId), seccionId ?? '', pedir);
}
