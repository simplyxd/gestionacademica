import { useDebouncedValue } from '@mantine/hooks';
import { useMemo, useState } from 'react';
import { asignaturaPorCodigo, estudiante } from '@/mocks/sga';
import type { DiaSemana, Seccion } from './types';

export interface FilaOferta {
  seccion: Seccion;
  inscritos: number;
  cupo: number;
  sinCupo: boolean;
  fueraDelPlan: boolean;
  /** Período en que la aprobó, si ya la aprobó. */
  aprobadaEn?: string;
  /** Códigos de prerrequisito que todavía no tiene aprobados. */
  prerrequisitosPendientes: string[];
  estaInscrita: boolean;
}

export type Ocupacion = { inscritos: number; cupo: number };

export function construirFilas(
  secciones: readonly Seccion[],
  ocupacionDe: (seccionId: string) => Ocupacion,
  estaInscrita: (seccionId: string) => boolean,
): FilaOferta[] {
  const aprobadas = new Map(estudiante.aprobadas.map((a) => [a.codigo, a.periodo]));

  return secciones.map((seccion) => {
    const { inscritos, cupo } = ocupacionDe(seccion.id);
    const prerrequisitos = asignaturaPorCodigo(seccion.codigoAsignatura)?.prerrequisitos ?? [];

    return {
      seccion,
      inscritos,
      cupo,
      sinCupo: inscritos >= cupo,
      fueraDelPlan: !estudiante.codigosDelPlan.includes(seccion.codigoAsignatura),
      aprobadaEn: aprobadas.get(seccion.codigoAsignatura),
      prerrequisitosPendientes: prerrequisitos.filter((c) => !aprobadas.has(c)),
      estaInscrita: estaInscrita(seccion.id),
    };
  });
}

/**
 * Filtros de la oferta. Al entrar se ven solo las asignaturas del plan, con las
 * secciones llenas visibles y marcadas sin cupo.
 */
export function useOferta(filas: FilaOferta[]) {
  const [busqueda, setBusqueda] = useState('');
  const [busquedaAplicada] = useDebouncedValue(busqueda, 250);
  const [verTodaLaOferta, setVerTodaLaOferta] = useState(false);
  const [soloConCupo, setSoloConCupo] = useState(false);
  const [modalidades, setModalidades] = useState<string[]>([]);
  const [jornadas, setJornadas] = useState<string[]>([]);
  const [dias, setDias] = useState<string[]>([]);

  const resultados = useMemo(() => {
    const termino = busquedaAplicada.trim().toLowerCase();

    return filas.filter((fila) => {
      const { seccion } = fila;

      if (!verTodaLaOferta && fila.fueraDelPlan) return false;
      if (soloConCupo && fila.sinCupo) return false;
      if (modalidades.length > 0 && !modalidades.includes(seccion.modalidad)) return false;
      if (jornadas.length > 0 && !jornadas.includes(seccion.jornada)) return false;
      if (dias.length > 0 && !seccion.bloques.some((b) => dias.includes(String(b.dia)))) return false;

      if (termino) {
        const campos = [seccion.codigoAsignatura, seccion.nombreAsignatura, seccion.docente];
        if (!campos.some((c) => c.toLowerCase().includes(termino))) return false;
      }

      return true;
    });
  }, [filas, busquedaAplicada, verTodaLaOferta, soloConCupo, modalidades, jornadas, dias]);

  const hayFiltrosActivos =
    busquedaAplicada.trim() !== '' ||
    soloConCupo ||
    modalidades.length > 0 ||
    jornadas.length > 0 ||
    dias.length > 0;

  const limpiarFiltros = () => {
    setBusqueda('');
    setSoloConCupo(false);
    setModalidades([]);
    setJornadas([]);
    setDias([]);
  };

  return {
    busqueda,
    setBusqueda,
    verTodaLaOferta,
    setVerTodaLaOferta,
    soloConCupo,
    setSoloConCupo,
    modalidades,
    setModalidades,
    jornadas,
    setJornadas,
    dias,
    setDias,
    resultados,
    hayFiltrosActivos,
    limpiarFiltros,
  };
}

export const DIAS_FILTRO: { value: string; label: string }[] = (
  [0, 1, 2, 3, 4, 5] as DiaSemana[]
).map((d) => ({ value: String(d), label: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d] }));
