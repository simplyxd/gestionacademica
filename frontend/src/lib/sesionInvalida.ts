// Canal entre api.ts y la app (decisión 6A): cuando el API responde 401 con un token, api.ts borra la sesión y
// avisa con este evento; <EscucharSesionInvalida /> lo escucha y redirige al login con React Router, sin recargar.
// Usa un EventTarget propio (y no window) para no depender del navegador y poder probarse en Node.

const EVENTO = 'sesion-invalida';
const canal = new EventTarget();

export function emitirSesionInvalida(): void {
  canal.dispatchEvent(new Event(EVENTO));
}

/** Registra quién quiere enterarse. Devuelve la función para dejar de escuchar (úsala al desmontar). */
export function escucharSesionInvalida(alAvisar: () => void): () => void {
  const oyente = () => alAvisar();
  canal.addEventListener(EVENTO, oyente);
  return () => canal.removeEventListener(EVENTO, oyente);
}
