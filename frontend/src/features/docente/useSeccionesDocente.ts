import { useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { useOfertaStore } from '@/features/oferta/OfertaContext';
import { usePeriodos } from '@/features/periodos/PeriodosContext';

/** Secciones que dicta el docente con sesión, del período elegido (por defecto, el que está en curso). */
export function useSeccionesDocente() {
  const { usuario } = useAuth();
  const { secciones } = useOfertaStore();
  const { periodos, periodoActual } = usePeriodos();
  const [periodoId, setPeriodoId] = useState(periodoActual?.id ?? periodos[0]?.id ?? '');

  const propias = useMemo(
    () =>
      secciones
        .filter((s) => s.docente === usuario.nombre && s.periodoId === periodoId)
        .sort((a, b) => a.codigoAsignatura.localeCompare(b.codigoAsignatura) || a.seccion.localeCompare(b.seccion)),
    [secciones, usuario.nombre, periodoId],
  );

  return { periodos, periodoId, setPeriodoId, periodo: periodos.find((p) => p.id === periodoId), propias };
}
