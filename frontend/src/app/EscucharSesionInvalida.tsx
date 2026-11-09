import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { escucharSesionInvalida } from '@/lib/sesionInvalida';
import { notify } from '@/lib/notify';

/**
 * Decisión 6A: cuando el API responde 401 con un token (la sesión venció o dejó de ser válida), api.ts borra el token
 * y avisa con un evento. Este componente lo escucha, cierra la sesión del contexto y lleva a la persona al login con
 * React Router, sin recargar la página. No pinta nada.
 */
export function EscucharSesionInvalida() {
  const { cerrarSesion } = useAuth();
  const navigate = useNavigate();

  useEffect(
    () =>
      escucharSesionInvalida(() => {
        cerrarSesion();
        notify.warning({ title: 'Tu sesión venció', message: 'Inicia sesión de nuevo para continuar.' });
        navigate('/login', { replace: true });
      }),
    [cerrarSesion, navigate],
  );

  return null;
}
