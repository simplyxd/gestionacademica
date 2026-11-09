import { describe, expect, it, vi } from 'vitest';
import { ApiError, crearApi } from './api';

// Contrato: éxito = { data } o { data, meta } (5A: api.ts entrega el JSON completo);
// error = { code, regla, message, details? }. api.ts es el ÚNICO lugar que hace fetch.
// 401 con token: borra la sesión y avisa (6A). 5xx: mensaje genérico, sin detalles (D-14).

const json = (status: number, cuerpo: unknown) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });

function entorno({ token = null as string | null, baseUrl = '' } = {}) {
  const fetchFn = vi.fn<typeof fetch>();
  const sesion = { getToken: vi.fn(() => token), setToken: vi.fn(), clear: vi.fn() };
  const alSesionInvalida = vi.fn();
  const api = crearApi({ baseUrl, fetchFn, sesion, alSesionInvalida });
  return { api, fetchFn, sesion, alSesionInvalida };
}

/** La última petición que recibió fetch, con sus cabeceras en un objeto simple. */
function ultimaPeticion(fetchFn: ReturnType<typeof entorno>['fetchFn']) {
  const [url, init] = fetchFn.mock.calls.at(-1) ?? [];
  return { url: String(url), init: (init ?? {}) as RequestInit & { headers: Record<string, string> } };
}

describe('crearApi · peticiones', () => {
  it('get entrega el JSON completo, con data y meta', async () => {
    const { api, fetchFn } = entorno();
    const cuerpo = { data: [{ id: '1' }], meta: { page: 1, limit: 20, total: 1 } };
    fetchFn.mockResolvedValue(json(200, cuerpo));

    expect(await api.get('/sedes')).toEqual(cuerpo);
  });

  it('arma la URL con /api y quita la barra final de la dirección del backend', async () => {
    const { api, fetchFn } = entorno({ baseUrl: 'https://api.sga.cl/' });
    fetchFn.mockResolvedValue(json(200, { data: null }));

    await api.get('/sedes');

    expect(ultimaPeticion(fetchFn).url).toBe('https://api.sga.cl/api/sedes');
  });

  it('sin dirección de backend usa la ruta relativa /api (el proxy de Vite la reenvía)', async () => {
    const { api, fetchFn } = entorno();
    fetchFn.mockResolvedValue(json(200, { data: null }));

    await api.get('/sedes');

    expect(ultimaPeticion(fetchFn).url).toBe('/api/sedes');
  });

  it('agrega la query sin los valores vacíos', async () => {
    const { api, fetchFn } = entorno();
    fetchFn.mockResolvedValue(json(200, { data: [] }));

    await api.get('/sedes', { query: { page: 2, limit: 10, q: '', sort: undefined, estado: null, activo: false } });

    expect(ultimaPeticion(fetchFn).url).toBe('/api/sedes?page=2&limit=10&activo=false');
  });

  it('manda el token en la cabecera Authorization y nunca en la URL', async () => {
    const { api, fetchFn } = entorno({ token: 'TOKEN_SECRETO' });
    fetchFn.mockResolvedValue(json(200, { data: null }));

    await api.get('/sedes');

    const { url, init } = ultimaPeticion(fetchFn);
    expect(init.headers.Authorization).toBe('Bearer TOKEN_SECRETO');
    expect(url).not.toContain('TOKEN_SECRETO');
  });

  it('sin token no manda Authorization', async () => {
    const { api, fetchFn } = entorno();
    fetchFn.mockResolvedValue(json(200, { data: null }));

    await api.get('/sedes');

    expect(ultimaPeticion(fetchFn).init.headers).not.toHaveProperty('Authorization');
  });

  it('post manda el cuerpo como JSON', async () => {
    const { api, fetchFn } = entorno();
    fetchFn.mockResolvedValue(json(201, { data: { id: '1' } }));

    const resultado = await api.post('/sedes', { codigo: 'SCL' });

    const { init } = ultimaPeticion(fetchFn);
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe('{"codigo":"SCL"}');
    expect(resultado).toEqual({ data: { id: '1' } });
  });

  it('patch, put y delete usan su método', async () => {
    const { api, fetchFn } = entorno();
    fetchFn.mockImplementation(async () => json(200, { data: null }));

    await api.patch('/sedes/1', { nombre: 'Nuevo' });
    expect(ultimaPeticion(fetchFn).init.method).toBe('PATCH');

    await api.put('/parametros', { siglasPortal: 'SGA' });
    expect(ultimaPeticion(fetchFn).init.method).toBe('PUT');
    expect(ultimaPeticion(fetchFn).init.body).toBe('{"siglasPortal":"SGA"}');

    await api.delete('/sedes/1');
    expect(ultimaPeticion(fetchFn).init.method).toBe('DELETE');
  });

  it('una respuesta 204 sin contenido devuelve null', async () => {
    const { api, fetchFn } = entorno();
    fetchFn.mockResolvedValue(new Response(null, { status: 204 }));

    expect(await api.delete('/sedes/1')).toBeNull();
  });

  it('pasa la señal de cancelación a fetch', async () => {
    const { api, fetchFn } = entorno();
    fetchFn.mockResolvedValue(json(200, { data: null }));
    const control = new AbortController();

    await api.get('/sedes', { senal: control.signal });

    expect(ultimaPeticion(fetchFn).init.signal).toBe(control.signal);
  });
});

describe('crearApi · errores', () => {
  it('un error de regla llega como ApiError con código, regla, mensaje y detalles', async () => {
    const { api, fetchFn } = entorno();
    fetchFn.mockResolvedValue(
      json(422, {
        code: 'INS_SIN_CUPO',
        regla: 'Cupo disponible',
        message: 'La sección MAT-101 A está llena (30/30).',
        details: { cupo: { inscritos: 30, maximo: 30 } },
      }),
    );

    const error = await api.post('/inscripciones', {}).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 422,
      code: 'INS_SIN_CUPO',
      regla: 'Cupo disponible',
      message: 'La sección MAT-101 A está llena (30/30).',
      details: { cupo: { inscritos: 30, maximo: 30 } },
    });
  });

  it('un error sin regla deja regla en null', async () => {
    const { api, fetchFn } = entorno();
    fetchFn.mockResolvedValue(json(404, { code: 'SED_NO_ENCONTRADA', regla: null, message: 'La sede no existe.' }));

    const error = await api.get('/sedes/9').catch((e: unknown) => e);

    expect((error as ApiError).regla).toBeNull();
  });

  it('un 5xx entrega un mensaje genérico y descarta los detalles del servidor (D-14)', async () => {
    const { api, fetchFn } = entorno();
    fetchFn.mockResolvedValue(
      json(500, { code: 'GEN_ERROR_INTERNO', regla: null, message: 'Fallo interno: TRAZA_SECRETA', details: { traza: 'TRAZA_SECRETA' } }),
    );

    const error = (await api.get('/sedes').catch((e: unknown) => e)) as ApiError;

    expect(error.status).toBe(500);
    expect(error.message).toBe('Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.');
    expect(error.details).toBeUndefined();
    expect(JSON.stringify(error)).not.toContain('TRAZA_SECRETA');
  });

  it('un 502 que devuelve HTML también se vuelve un error genérico', async () => {
    const { api, fetchFn } = entorno();
    fetchFn.mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }));

    const error = (await api.get('/sedes').catch((e: unknown) => e)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(502);
    expect(error.message).toBe('Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.');
  });

  it('un 4xx que no trae JSON se vuelve GEN_RESPUESTA_INVALIDA', async () => {
    const { api, fetchFn } = entorno();
    fetchFn.mockResolvedValue(new Response('<html>Not found</html>', { status: 404 }));

    const error = (await api.get('/sedes').catch((e: unknown) => e)) as ApiError;

    expect(error).toMatchObject({ status: 404, code: 'GEN_RESPUESTA_INVALIDA' });
  });

  it('un éxito que no es JSON también falla con GEN_RESPUESTA_INVALIDA', async () => {
    const { api, fetchFn } = entorno();
    fetchFn.mockResolvedValue(new Response('<html>hola</html>', { status: 200 }));

    const error = (await api.get('/sedes').catch((e: unknown) => e)) as ApiError;

    expect(error).toMatchObject({ status: 200, code: 'GEN_RESPUESTA_INVALIDA' });
  });

  it('sin conexión con el servidor entrega un ApiError de status 0', async () => {
    const { api, fetchFn } = entorno();
    fetchFn.mockRejectedValue(new TypeError('Failed to fetch'));

    const error = (await api.get('/sedes').catch((e: unknown) => e)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 0,
      code: 'GEN_SIN_CONEXION',
      message: 'Sin conexión con el servidor. Revisa tu conexión e inténtalo de nuevo.',
    });
  });

  it('una petición cancelada NO es un error para mostrar: se relanza tal cual', async () => {
    const { api, fetchFn } = entorno();
    fetchFn.mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    const error = await api.get('/sedes').catch((e: unknown) => e);

    expect(error).not.toBeInstanceOf(ApiError);
    expect((error as Error).name).toBe('AbortError');
  });
});

describe('crearApi · sesión vencida (401)', () => {
  it('con token: borra la sesión, avisa una vez y lanza el error', async () => {
    const { api, fetchFn, sesion, alSesionInvalida } = entorno({ token: 'viejo' });
    fetchFn.mockResolvedValue(json(401, { code: 'AUT_TOKEN_VENCIDO', regla: null, message: 'Tu sesión venció. Inicia sesión de nuevo.' }));

    const error = (await api.get('/sedes').catch((e: unknown) => e)) as ApiError;

    expect(error).toMatchObject({ status: 401, code: 'AUT_TOKEN_VENCIDO' });
    expect(sesion.clear).toHaveBeenCalledTimes(1);
    expect(alSesionInvalida).toHaveBeenCalledTimes(1);
  });

  it('con token, si la clave actual no coincide, no cierra la sesión', async () => {
    const { api, fetchFn, sesion, alSesionInvalida } = entorno({ token: 'valido' });
    fetchFn.mockResolvedValue(json(401, { code: 'AUT_CLAVE_ACTUAL_INCORRECTA', regla: null, message: 'La clave actual no es correcta.' }));

    const error = (await api.post('/auth/cambiar-clave', {}).catch((e: unknown) => e)) as ApiError;

    expect(error.code).toBe('AUT_CLAVE_ACTUAL_INCORRECTA');
    expect(sesion.clear).not.toHaveBeenCalled();
    expect(alSesionInvalida).not.toHaveBeenCalled();
  });

  it('sin token (por ejemplo, contraseña incorrecta en el login) NO cierra sesión ni avisa', async () => {
    const { api, fetchFn, sesion, alSesionInvalida } = entorno();
    fetchFn.mockResolvedValue(json(401, { code: 'AUT_CREDENCIALES_INVALIDAS', regla: null, message: 'Correo o contraseña incorrectos.' }));

    const error = (await api.post('/auth/login', {}).catch((e: unknown) => e)) as ApiError;

    expect(error.code).toBe('AUT_CREDENCIALES_INVALIDAS');
    expect(sesion.clear).not.toHaveBeenCalled();
    expect(alSesionInvalida).not.toHaveBeenCalled();
  });

  it('un 403 no cierra la sesión: tiene sesión, solo le falta permiso', async () => {
    const { api, fetchFn, sesion, alSesionInvalida } = entorno({ token: 'valido' });
    fetchFn.mockResolvedValue(json(403, { code: 'AUT_SIN_PERMISO', regla: null, message: 'Tu rol no tiene permiso.' }));

    await api.get('/usuarios').catch(() => undefined);

    expect(sesion.clear).not.toHaveBeenCalled();
    expect(alSesionInvalida).not.toHaveBeenCalled();
  });
});
