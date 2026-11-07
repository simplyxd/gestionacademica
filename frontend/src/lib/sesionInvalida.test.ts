import { describe, expect, it, vi } from 'vitest';
import { emitirSesionInvalida, escucharSesionInvalida } from './sesionInvalida';

// Decisión 6A: cuando el API responde 401 con un token, api.ts avisa con un evento y el contexto de sesión
// redirige al login con React Router. Este módulo es el canal entre los dos (sin depender de window).

describe('sesionInvalida', () => {
  it('avisa a quien está escuchando', () => {
    const alAvisar = vi.fn();
    const dejarDeEscuchar = escucharSesionInvalida(alAvisar);

    emitirSesionInvalida();

    expect(alAvisar).toHaveBeenCalledTimes(1);
    dejarDeEscuchar();
  });

  it('avisa a todos los que escuchan', () => {
    const uno = vi.fn();
    const otro = vi.fn();
    const cancelarUno = escucharSesionInvalida(uno);
    const cancelarOtro = escucharSesionInvalida(otro);

    emitirSesionInvalida();

    expect(uno).toHaveBeenCalledTimes(1);
    expect(otro).toHaveBeenCalledTimes(1);
    cancelarUno();
    cancelarOtro();
  });

  it('deja de avisar cuando se cancela la escucha', () => {
    const alAvisar = vi.fn();
    const dejarDeEscuchar = escucharSesionInvalida(alAvisar);
    dejarDeEscuchar();

    emitirSesionInvalida();

    expect(alAvisar).not.toHaveBeenCalled();
  });

  it('emitir sin nadie escuchando no falla', () => {
    expect(() => emitirSesionInvalida()).not.toThrow();
  });
});
