import { useCallback, useEffect, useState } from 'react';
import { ApiError, api as apiPorDefecto, type Api, type Meta, type Query, type RespuestaLista } from './api';

// Paginación contra el servidor (?page=&limit=&sort=&filtros): las tablas dejan de paginar en memoria.
// La lógica (query y cálculo de páginas) son funciones puras con tests; el hook solo las une con React.
// Para listas pequeñas y locales sigue sirviendo usePaginacion (en memoria).

export interface ParametrosDePagina {
  pagina: number;
  limite: number;
  /** Formato del contrato: "apellido" (ascendente) o "-apellido" (descendente). */
  orden?: string;
  filtros?: Query;
}

// Los filtros nunca pueden pisar la paginación.
const RESERVADOS = new Set(['page', 'limit', 'sort']);

export function construirQuery({ pagina, limite, orden, filtros = {} }: ParametrosDePagina): Query {
  const query: Query = {};
  for (const [clave, valor] of Object.entries(filtros)) {
    if (!RESERVADOS.has(clave) && valor !== undefined && valor !== null && valor !== '') query[clave] = valor;
  }
  return { page: pagina, limit: limite, ...(orden ? { sort: orden } : {}), ...query };
}

export function totalPaginas(total: number, limite: number): number {
  return Math.max(1, Math.ceil(total / limite));
}

export function cargarPagina<T>(
  api: Pick<Api, 'get'>,
  ruta: string,
  parametros: ParametrosDePagina,
  senal?: AbortSignal,
): Promise<RespuestaLista<T>> {
  return api.get<RespuestaLista<T>>(ruta, { query: construirQuery(parametros), senal });
}

export interface OpcionesDelHook {
  ruta: string;
  limite?: number;
  orden?: string;
  filtros?: Query;
  /** Debe ser estable entre renders (una constante o la instancia por defecto), o se vuelve a pedir en cada render. */
  api?: Pick<Api, 'get'>;
}

export function usePaginacionServidor<T>({ ruta, limite = 20, orden, filtros, api = apiPorDefecto }: OpcionesDelHook) {
  // Si cambian la ruta, los filtros, el orden o el límite, la página vuelve a 1 sin pedir dos veces.
  const claveFiltros = JSON.stringify(filtros ?? {});
  const clave = `${ruta}|${limite}|${orden ?? ''}|${claveFiltros}`;
  const [seleccion, setSeleccion] = useState({ clave, pagina: 1 });
  const pagina = seleccion.clave === clave ? seleccion.pagina : 1;
  const setPagina = useCallback((nueva: number) => setSeleccion({ clave, pagina: nueva }), [clave]);

  const [recarga, setRecarga] = useState(0);
  const clavePeticion = `${clave}|${pagina}|${recarga}`;

  // Se guarda el último resultado junto con la petición que lo produjo. "cargando" se DERIVA de comparar esa clave
  // con la petición actual: así el efecto no llama a setState de forma síncrona y, mientras llega la página nueva,
  // se siguen mostrando los datos anteriores en vez de parpadear una tabla vacía.
  const [resultado, setResultado] = useState<{ clave: string; datos: T[]; meta: Meta | null; error: ApiError | null } | null>(null);

  useEffect(() => {
    const control = new AbortController();

    cargarPagina<T>(api, ruta, { pagina, limite, orden, filtros: JSON.parse(claveFiltros) as Query }, control.signal)
      .then((respuesta) => {
        if (control.signal.aborted) return; // una respuesta atrasada no pisa a la más nueva
        setResultado({ clave: clavePeticion, datos: respuesta.data, meta: respuesta.meta, error: null });
      })
      .catch((causa: unknown) => {
        if (control.signal.aborted) return;
        const error =
          causa instanceof ApiError
            ? causa
            : new ApiError({ status: 0, code: 'GEN_ERROR_INESPERADO', message: 'Ocurrió un error inesperado.' });
        setResultado((previo) => ({ clave: clavePeticion, datos: previo?.datos ?? [], meta: previo?.meta ?? null, error }));
      });

    return () => control.abort();
  }, [api, ruta, pagina, limite, orden, claveFiltros, clavePeticion]);

  const cargando = resultado?.clave !== clavePeticion;
  const total = resultado?.meta?.total ?? 0;
  const recargar = useCallback(() => setRecarga((n) => n + 1), []);

  return {
    datos: resultado?.datos ?? [],
    pagina,
    setPagina,
    limite,
    total,
    totalPaginas: totalPaginas(total, limite),
    cargando,
    error: cargando ? null : (resultado?.error ?? null),
    recargar,
  };
}
