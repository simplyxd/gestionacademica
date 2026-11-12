import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import type { Rol } from '@/app/navigation';
import { ApiError, api, type RespuestaItem } from '@/lib/api';
import { notify } from '@/lib/notify';
import { session } from '@/lib/session';
import {
  borrarUsuarioDemo,
  CUENTAS_DEMO,
  esTokenDemo,
  guardarUsuarioDemo,
  leerUsuarioDemo,
  TOKEN_DEMO,
  usuarioDesdeCuenta,
  type CuentaDemo,
} from '@/mocks/demoUsuarios';
import { esAbort, leerLogin, normalizarUsuario, type Usuario } from './usuario';

export type { Usuario };

/** Sesión de la interfaz: el token vive en `session` (sessionStorage, clave sga.token). */
export interface Sesion {
  correo: string;
}

const INVITADO: Usuario = {
  id: '',
  nombre: '',
  rol: 'coordinador',
  iniciales: '',
  sedes: [],
  debeCambiarClave: false,
  correo: '',
};

interface AuthStore {
  /** Siempre hay un objeto (el encabezado lo lee). Sin sesión es un invitado vacío: mira `sesion`. */
  usuario: Usuario;
  sesion: Sesion | null;
  cargando: boolean;
  errorSesion: string | null;
  /**
   * «Probar como…» del encabezado. Solo en desarrollo cambia el rol que ve la interfaz;
   * no toca el token. En producción la función no hace nada (el bundler elimina el cuerpo).
   */
  cambiarRol: (rol: Rol) => void;
  iniciarSesion: (correo: string, password: string) => Promise<Usuario>;
  /** Entrada local (sin API) para la demo de períodos e inscripción. */
  iniciarSesionDemo: (cuenta: CuentaDemo) => Usuario;
  cerrarSesion: () => void;
  recargarSesion: () => void;
  /** Vuelve a pedir /auth/me y deja el usuario que respondió el servidor. */
  refrescarUsuario: () => Promise<Usuario>;
}

const AuthContext = createContext<AuthStore | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [usuarioReal, setUsuarioReal] = useState<Usuario | null>(null);
  const [rolDePrueba, setRolDePrueba] = useState<Rol | null>(null);
  const [fase, setFase] = useState<'cargando' | 'lista'>(() => (session.getToken() ? 'cargando' : 'lista'));
  const [errorSesion, setErrorSesion] = useState<string | null>(null);
  const [ciclo, setCiclo] = useState(0);

  useEffect(() => {
    const token = session.getToken();
    if (!token) return;

    // Demo local (períodos + inscripción): no llama a /auth/me.
    if (esTokenDemo(token)) {
      const demo = leerUsuarioDemo() ?? CUENTAS_DEMO.map(usuarioDesdeCuenta).find((u) => token === `${TOKEN_DEMO}:${u.id}`) ?? null;
      if (!demo) {
        session.clear();
        borrarUsuarioDemo();
        setUsuarioReal(null);
        setErrorSesion('No se pudo restaurar la demo. Entra de nuevo con una cuenta de demostración.');
        setFase('lista');
        return;
      }
      setUsuarioReal(demo);
      setErrorSesion(null);
      setFase('lista');
      return;
    }

    const control = new AbortController();
    let vivo = true;

    api
      .get<RespuestaItem<unknown>>('/auth/me', { senal: control.signal })
      .then((respuesta) => {
        if (!vivo) return;
        const fresco = normalizarUsuario(respuesta.data);
        if (!fresco) {
          session.clear();
          setUsuarioReal(null);
          setErrorSesion('No se pudo leer tu sesión. Inicia sesión de nuevo.');
          setFase('lista');
          return;
        }
        setUsuarioReal(fresco);
        setErrorSesion(null);
        setFase('lista');
      })
      .catch((error: unknown) => {
        if (!vivo || esAbort(error)) return;
        // 401 con token: api.ts ya borró la sesión y avisó. Al entrar todavía no está montado
        // quien redirige, así que el aviso sale de aquí y RequireAuth manda al login.
        if (error instanceof ApiError && error.status === 401) {
          setUsuarioReal(null);
          setRolDePrueba(null);
          setErrorSesion(null);
          setFase('lista');
          notify.warning({
            id: 'sesion-vencida',
            title: 'Tu sesión venció',
            message: 'Inicia sesión de nuevo para continuar.',
          });
          return;
        }
        setFase('lista');
        setErrorSesion(
          error instanceof ApiError ? error.message : 'No se pudo comprobar tu sesión. Revisa tu conexión e inténtalo de nuevo.',
        );
      });

    return () => {
      vivo = false;
      control.abort();
    };
  }, [ciclo]);

  const cambiarRol = useCallback((rol: Rol) => {
    if (!import.meta.env.DEV) return;
    setRolDePrueba(rol);
  }, []);

  const iniciarSesionDemo = useCallback((cuenta: CuentaDemo) => {
    const usuario = usuarioDesdeCuenta(cuenta);
    session.setToken(`${TOKEN_DEMO}:${cuenta.id}`);
    guardarUsuarioDemo(usuario);
    setUsuarioReal(usuario);
    setRolDePrueba(null);
    setErrorSesion(null);
    setFase('lista');
    return usuario;
  }, []);

  const iniciarSesion = useCallback(async (correo: string, password: string) => {
    const respuesta = await api.post<RespuestaItem<unknown>>('/auth/login', { correo: correo.trim(), password });
    const leido = leerLogin(respuesta.data, correo);
    if (!leido) {
      throw new ApiError({
        status: 0,
        code: 'GEN_RESPUESTA_INVALIDA',
        message: 'No se pudo interpretar la respuesta del servidor.',
      });
    }
    borrarUsuarioDemo();
    session.setToken(leido.token);
    setUsuarioReal(leido.usuario);
    setRolDePrueba(null);
    setErrorSesion(null);
    setFase('lista');
    return leido.usuario;
  }, []);

  const cerrarSesion = useCallback(() => {
    session.clear();
    borrarUsuarioDemo();
    setUsuarioReal(null);
    setRolDePrueba(null);
    setErrorSesion(null);
    setFase('lista');
  }, []);

  const recargarSesion = useCallback(() => {
    if (!session.getToken()) {
      setErrorSesion(null);
      setFase('lista');
      return;
    }
    setErrorSesion(null);
    setFase('cargando');
    setCiclo((n) => n + 1);
  }, []);

  const refrescarUsuario = useCallback(async () => {
    if (esTokenDemo(session.getToken())) {
      const demo = leerUsuarioDemo();
      if (!demo) {
        throw new ApiError({
          status: 0,
          code: 'GEN_RESPUESTA_INVALIDA',
          message: 'No se pudo leer la sesión de demostración.',
        });
      }
      setUsuarioReal(demo);
      setErrorSesion(null);
      setFase('lista');
      return demo;
    }
    const respuesta = await api.get<RespuestaItem<unknown>>('/auth/me');
    const fresco = normalizarUsuario(respuesta.data, usuarioReal?.correo ?? '');
    if (!fresco) {
      throw new ApiError({
        status: 0,
        code: 'GEN_RESPUESTA_INVALIDA',
        message: 'No se pudo leer tu sesión.',
      });
    }
    setUsuarioReal(fresco);
    setErrorSesion(null);
    setFase('lista');
    return fresco;
  }, [usuarioReal?.correo]);

  const usuario = useMemo(() => {
    const base = usuarioReal ?? INVITADO;
    if (import.meta.env.DEV && usuarioReal && rolDePrueba) return { ...base, rol: rolDePrueba };
    return base;
  }, [usuarioReal, rolDePrueba]);

  const sesion = useMemo<Sesion | null>(() => (usuarioReal ? { correo: usuarioReal.correo } : null), [usuarioReal]);

  const value = useMemo(
    () => ({
      usuario,
      sesion,
      cargando: fase === 'cargando',
      errorSesion,
      cambiarRol,
      iniciarSesion,
      iniciarSesionDemo,
      cerrarSesion,
      recargarSesion,
      refrescarUsuario,
    }),
    [usuario, sesion, fase, errorSesion, cambiarRol, iniciarSesion, iniciarSesionDemo, cerrarSesion, recargarSesion, refrescarUsuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthStore {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
