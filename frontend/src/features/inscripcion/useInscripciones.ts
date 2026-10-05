import { useCallback, useMemo, useState } from 'react';
import type { BloqueHorario, EstadoBloque } from '@/features/horario/types';
import type { Seccion } from '@/features/oferta/types';
import { inscripcionesIniciales } from '@/mocks/sga';
import type { Inscripcion } from './types';

function bloquesDeSeccion(seccion: Seccion, estado: EstadoBloque): BloqueHorario[] {
  return seccion.bloques.map((b, i) => ({
    id: `${seccion.id}-${i}`,
    seccionId: seccion.id,
    codigoAsignatura: seccion.codigoAsignatura,
    nombreAsignatura: seccion.nombreAsignatura,
    seccion: seccion.seccion,
    sala: seccion.sala,
    dia: b.dia,
    inicioMin: b.inicioMin,
    finMin: b.finMin,
    estado,
  }));
}

/**
 * Estado de las inscripciones del estudiante de prueba. Vive en el cliente:
 * no hay API. Anular cambia el estado a `anulada` y libera el cupo, sin borrar
 * el registro.
 */
export function useInscripciones(secciones: readonly Seccion[]) {
  const porId = useMemo(() => new Map(secciones.map((s) => [s.id, s])), [secciones]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>(inscripcionesIniciales);

  /**
   * Reinscribir una sección que se había anulado reusa su registro, así no
   * aparece a la vez en el horario y en la lista de anuladas.
   */
  const inscribir = useCallback((seccionId: string) => {
    setInscripciones((prev) => {
      if (prev.some((i) => i.seccionId === seccionId)) {
        return prev.map((i) => (i.seccionId === seccionId ? { ...i, estado: 'inscrita' } : i));
      }
      return [...prev, { id: `ins-${seccionId}`, seccionId, estado: 'inscrita' }];
    });
  }, []);

  const anular = useCallback((seccionId: string) => {
    setInscripciones((prev) =>
      prev.map((i) =>
        i.seccionId === seccionId && i.estado === 'inscrita' ? { ...i, estado: 'anulada' } : i,
      ),
    );
  }, []);

  /**
   * Reemplaza una sección por otra en un solo paso: la anterior queda anulada
   * y la nueva inscrita. Si no elige nada, este método no se llama.
   */
  const cambiarSeccion = useCallback((desdeId: string, haciaId: string) => {
    setInscripciones((prev) => {
      const conAnulada = prev.map((i): Inscripcion =>
        i.seccionId === desdeId && i.estado === 'inscrita' ? { ...i, estado: 'anulada' } : i,
      );
      if (conAnulada.some((i) => i.seccionId === haciaId)) {
        return conAnulada.map((i) => (i.seccionId === haciaId ? { ...i, estado: 'inscrita' } : i));
      }
      return [...conAnulada, { id: `ins-${haciaId}`, seccionId: haciaId, estado: 'inscrita' }];
    });
  }, []);

  const inscritas = useMemo(
    () => inscripciones.filter((i) => i.estado === 'inscrita'),
    [inscripciones],
  );

  const anuladas = useMemo(
    () => inscripciones.filter((i) => i.estado === 'anulada'),
    [inscripciones],
  );

  /** Bloques de las secciones que siguen inscritas: lo que se ve en el horario. */
  const bloquesInscritos = useMemo(
    () =>
      inscritas.flatMap((i) => {
        const seccion = porId.get(i.seccionId);
        return seccion ? bloquesDeSeccion(seccion, 'inscrita') : [];
      }),
    [inscritas, porId],
  );

  const estaInscrita = useCallback(
    (seccionId: string) => inscritas.some((i) => i.seccionId === seccionId),
    [inscritas],
  );

  /** Códigos de asignatura con al menos una sección inscrita. */
  const codigosInscritos = useMemo(() => {
    const set = new Set<string>();
    for (const i of inscritas) {
      const seccion = porId.get(i.seccionId);
      if (seccion) set.add(seccion.codigoAsignatura);
    }
    return set;
  }, [inscritas, porId]);

  /**
   * Otra sección inscrita de la misma asignatura. Es el caso de «cambiar
   * sección»: inscribir la nueva sin más dejaría la asignatura dos veces.
   */
  const otraSeccionDeLaAsignatura = useCallback(
    (codigoAsignatura: string, exceptoSeccionId: string) =>
      inscritas
        .map((i) => porId.get(i.seccionId))
        .find((s) => s && s.codigoAsignatura === codigoAsignatura && s.id !== exceptoSeccionId),
    [inscritas, porId],
  );

  /** Ocupación actual de una sección: el estudiante cuenta solo si sigue inscrito. */
  const ocupacionDe = useCallback(
    (seccionId: string) => {
      const seccion = porId.get(seccionId);
      if (!seccion) return { inscritos: 0, cupo: 0 };
      const propia = inscritas.some((i) => i.seccionId === seccionId) ? 1 : 0;
      return { inscritos: seccion.inscritosOtros + propia, cupo: seccion.cupo };
    },
    [inscritas, porId],
  );

  const seccionPorId = useCallback((seccionId: string) => porId.get(seccionId), [porId]);

  return {
    inscripciones,
    anuladas,
    bloquesInscritos,
    inscribir,
    anular,
    cambiarSeccion,
    estaInscrita,
    codigosInscritos,
    otraSeccionDeLaAsignatura,
    ocupacionDe,
    seccionPorId,
  };
}

export { bloquesDeSeccion };
