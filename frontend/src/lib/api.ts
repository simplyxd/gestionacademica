// Cliente HTTP único del frontend: es el ÚNICO lugar que hace fetch.
//
//   import { api } from '@/lib/api';
//   const { data, meta } = await api.get<RespuestaLista<Sede>>('/sedes', { query: { page: 1 } });
//   const { data: sede } = await api.post<RespuestaItem<Sede>>('/sedes', { codigo: 'SCL' });
//
// Decisiones: entrega el JSON completo del contrato, { data } o { data, meta } (5A); lanza ApiError con la
// forma del contrato; 401 con token => borra la sesión y avisa (6A); 5xx => mensaje genérico sin detalles (D-14);
// sin conexión => ApiError de status 0.

import { session, type Sesion } from './session';
import { emitirSesionInvalida } from './sesionInvalida';

export interface Meta {
  page: number;
  limit: number;
  total: number;
}
export interface RespuestaItem<T> {
  data: T;
}
export interface RespuestaLista<T> {
  data: T[];
  meta: Meta;
}

export interface DatosDeError {
  status: number;
  code: string;
  regla?: string | null;
  message: string;
  details?: unknown;
}

/** Error del API con la forma del contrato: { code, regla, message, details? } más el status HTTP. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly regla: string | null;
  readonly details?: unknown;

  constructor({ status, code, regla = null, message, details }: DatosDeError) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.regla = regla;
    this.details = details;
  }
}

export type Query = Record<string, string | number | boolean | null | undefined>;

export interface OpcionesDePeticion {
  query?: Query;
  /** Para cancelar la petición (por ejemplo, al desmontar una pantalla). */
  senal?: AbortSignal;
}

export interface Dependencias {
  /** Dirección del backend. Vacía en desarrollo: la ruta relativa /api la reenvía el proxy de Vite. */
  baseUrl?: string;
  fetchFn?: typeof fetch;
  sesion?: Sesion;
  alSesionInvalida?: () => void;
}

const MENSAJE_5XX = 'Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.';
const MENSAJE_SIN_CONEXION = 'Sin conexión con el servidor. Revisa tu conexión e inténtalo de nuevo.';
const MENSAJE_RESPUESTA_INVALIDA = 'No se pudo interpretar la respuesta del servidor.';

function construirUrl(base: string, ruta: string, query?: Query): string {
  const parametros = new URLSearchParams();
  for (const [clave, valor] of Object.entries(query ?? {})) {
    if (valor !== undefined && valor !== null && valor !== '') parametros.set(clave, String(valor));
  }
  const texto = parametros.toString();
  const rutaConBarra = ruta.startsWith('/') ? ruta : `/${ruta}`;
  return `${base}/api${rutaConBarra}${texto ? `?${texto}` : ''}`;
}

function esCancelacion(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AbortError';
}

function esCuerpoDeError(cuerpo: unknown): cuerpo is DatosDeError {
  if (typeof cuerpo !== 'object' || cuerpo === null) return false;
  const { code, message } = cuerpo as Record<string, unknown>;
  return typeof code === 'string' && typeof message === 'string';
}

export function crearApi({
  baseUrl = '',
  fetchFn = (entrada, init) => fetch(entrada, init),
  sesion = session,
  alSesionInvalida = emitirSesionInvalida,
}: Dependencias = {}) {
  const base = baseUrl.replace(/\/+$/, '');

  async function aErrorDeApi(respuesta: Response, teniaToken: boolean): Promise<ApiError> {
    let cuerpo: unknown = null;
    try {
      cuerpo = await respuesta.json();
    } catch {
      /* la respuesta no es JSON (por ejemplo, el HTML de un proxy caído) */
    }
    const datos = esCuerpoDeError(cuerpo) ? cuerpo : null;

    // 401 con token = la sesión venció o dejó de ser válida. Sin token (p. ej. clave incorrecta en el login) no.
    // La clave actual incorrecta al cambiarla también es 401, pero la sesión sigue viva.
    const sesionMuerta =
      !datos?.code ||
      datos.code === 'AUT_TOKEN_VENCIDO' ||
      datos.code === 'AUT_TOKEN_INVALIDO' ||
      datos.code === 'AUT_TOKEN_AUSENTE' ||
      datos.code === 'AUT_SESION_INVALIDA' ||
      datos.code === 'AUT_CUENTA_INACTIVA';
    // La demo local usa un token sintético: un 401 del proxy no debe echar al alumno.
    const token = sesion.getToken();
    const esDemo = typeof token === 'string' && token.startsWith('__sga_demo__');
    if (respuesta.status === 401 && teniaToken && sesionMuerta && !esDemo) {
      sesion.clear();
      alSesionInvalida();
    }

    // Un 5xx es falla nuestra: la persona no necesita (ni debe ver) el detalle técnico.
    if (respuesta.status >= 500) {
      return new ApiError({ status: respuesta.status, code: datos?.code ?? 'GEN_ERROR_INTERNO', message: MENSAJE_5XX });
    }
    if (!datos) {
      return new ApiError({ status: respuesta.status, code: 'GEN_RESPUESTA_INVALIDA', message: MENSAJE_RESPUESTA_INVALIDA });
    }
    return new ApiError({
      status: respuesta.status,
      code: datos.code,
      regla: datos.regla ?? null,
      message: datos.message,
      details: datos.details,
    });
  }

  async function pedir<T>(metodo: string, ruta: string, cuerpo?: unknown, opciones: OpcionesDePeticion = {}): Promise<T> {
    const token = sesion.getToken();
    const cabeceras: Record<string, string> = { Accept: 'application/json' };
    if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json';
    if (token) cabeceras.Authorization = `Bearer ${token}`;

    let respuesta: Response;
    try {
      respuesta = await fetchFn(construirUrl(base, ruta, opciones.query), {
        method: metodo,
        headers: cabeceras,
        body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
        signal: opciones.senal,
      });
    } catch (error) {
      if (esCancelacion(error)) throw error; // cancelar no es un fallo que mostrar
      throw new ApiError({ status: 0, code: 'GEN_SIN_CONEXION', message: MENSAJE_SIN_CONEXION });
    }

    if (!respuesta.ok) throw await aErrorDeApi(respuesta, Boolean(token));
    if (respuesta.status === 204) return null as T;

    try {
      return (await respuesta.json()) as T;
    } catch {
      throw new ApiError({ status: respuesta.status, code: 'GEN_RESPUESTA_INVALIDA', message: MENSAJE_RESPUESTA_INVALIDA });
    }
  }

  return {
    get: <T>(ruta: string, opciones?: OpcionesDePeticion) => pedir<T>('GET', ruta, undefined, opciones),
    post: <T>(ruta: string, cuerpo?: unknown, opciones?: OpcionesDePeticion) => pedir<T>('POST', ruta, cuerpo, opciones),
    put: <T>(ruta: string, cuerpo?: unknown, opciones?: OpcionesDePeticion) => pedir<T>('PUT', ruta, cuerpo, opciones),
    patch: <T>(ruta: string, cuerpo?: unknown, opciones?: OpcionesDePeticion) => pedir<T>('PATCH', ruta, cuerpo, opciones),
    delete: <T>(ruta: string, opciones?: OpcionesDePeticion) => pedir<T>('DELETE', ruta, undefined, opciones),
  };
}

export type Api = ReturnType<typeof crearApi>;

/** Instancia que usa la app. En desarrollo VITE_API_URL queda vacío y el proxy de Vite reenvía /api al backend. */
export const api: Api = crearApi({ baseUrl: import.meta.env.VITE_API_URL ?? '' });
