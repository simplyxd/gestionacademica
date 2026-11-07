// Dónde se guarda el token de sesión (JWT). Decisión D-13: sessionStorage, es decir, se pierde al cerrar la pestaña.
// Es provisional: Endert lo revisa en su decisión de autenticación. Este es el ÚNICO archivo que toca el almacenamiento
// del token; el resto de la app usa session.getToken() / setToken() / clear().

const CLAVE_TOKEN = 'sga.token';

export interface Sesion {
  getToken: () => string | null;
  setToken: (token: string) => void;
  clear: () => void;
}

/** sessionStorage puede no existir (sin navegador) o lanzar al leerlo (modo privado, bloqueado): nunca rompe la app. */
function almacen(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}

export const session: Sesion = {
  getToken() {
    try {
      return almacen()?.getItem(CLAVE_TOKEN) ?? null;
    } catch {
      return null;
    }
  },
  setToken(token) {
    try {
      almacen()?.setItem(CLAVE_TOKEN, token);
    } catch {
      /* sin persistencia: la sesión vale solo mientras no se recargue la página */
    }
  },
  clear() {
    try {
      almacen()?.removeItem(CLAVE_TOKEN);
    } catch {
      /* sessionStorage no disponible: no hay nada que borrar */
    }
  },
};
