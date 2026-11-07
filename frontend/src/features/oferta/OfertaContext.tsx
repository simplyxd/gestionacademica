import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { OFERTA_SEED } from '@/mock/oferta';
import { asignaturaPorCodigo } from '@/mocks/sga';
import { type Conflicto } from './conflictos';
import { conflictosDeInput, siguienteLetra, validarSeccion, type ErroresSeccion, type SeccionInput } from './reglasOferta';
import type { SeccionOfertada } from './types';

export type ResultadoSeccion =
  | { ok: true; value: SeccionOfertada }
  | { ok: false; errores: ErroresSeccion; conflictos: Conflicto[] };

interface OfertaStore {
  secciones: SeccionOfertada[];
  /** Crea (sin `id`) o actualiza una sección. Rechaza campos inválidos y choques de docente o sala. */
  guardar: (input: SeccionInput, id?: string) => ResultadoSeccion;
}

const OfertaContext = createContext<OfertaStore | null>(null);

/**
 * Oferta del coordinador, en memoria (sin persistencia). Es la fuente única de secciones: el estudiante,
 * el docente y el coordinador ven las mismas.
 */
export function OfertaProvider({ children }: PropsWithChildren) {
  const [secciones, setSecciones] = useState<SeccionOfertada[]>(OFERTA_SEED);

  const guardar = useCallback<OfertaStore['guardar']>(
    (input, id) => {
      const editando = id ? secciones.find((s) => s.id === id) : undefined;
      const errores = validarSeccion(input, editando);
      const conflictos = conflictosDeInput(input, id ?? '', secciones);
      if (Object.keys(errores).length > 0 || conflictos.length > 0) return { ok: false, errores, conflictos };

      const asignatura = asignaturaPorCodigo(input.codigoAsignatura);
      const letra = editando?.seccion ?? siguienteLetra(secciones, input.periodoId, input.codigoAsignatura);
      const value: SeccionOfertada = {
        id: editando?.id ?? `sec-${input.codigoAsignatura.toLowerCase().replace('-', '')}-${letra.toLowerCase()}-${input.periodoId}`,
        codigoAsignatura: input.codigoAsignatura,
        nombreAsignatura: asignatura?.nombre ?? input.codigoAsignatura,
        seccion: letra,
        docente: input.docente,
        sala: input.modalidad === 'online' ? undefined : input.sala,
        modalidad: input.modalidad as SeccionOfertada['modalidad'],
        jornada: input.jornada as SeccionOfertada['jornada'],
        cupo: input.cupo,
        inscritosOtros: editando?.inscritosOtros ?? 0,
        periodoId: input.periodoId,
        sede: input.sede,
        bloques: input.bloques.map((b) => ({ dia: b.dia, inicioMin: b.inicioMin, finMin: b.finMin })),
      };
      setSecciones((actuales) => (editando ? actuales.map((s) => (s.id === editando.id ? value : s)) : [...actuales, value]));
      return { ok: true, value };
    },
    [secciones],
  );

  const value = useMemo(() => ({ secciones, guardar }), [secciones, guardar]);
  return <OfertaContext.Provider value={value}>{children}</OfertaContext.Provider>;
}

export function useOfertaStore(): OfertaStore {
  const ctx = useContext(OfertaContext);
  if (!ctx) throw new Error('useOfertaStore debe usarse dentro de OfertaProvider');
  return ctx;
}
