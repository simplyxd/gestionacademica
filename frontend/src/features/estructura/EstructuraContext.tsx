import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { Asignatura } from '@/features/oferta/types';
import { CARRERAS, PLANES } from '@/mock/estructura';
import type { Carrera, EstadoCarrera, EstadoPlan, PlanEstudio } from '@/mock/types';
import { asignaturas as ASIGNATURAS_SGA } from '@/mocks/sga';
import {
  buscarAsignatura,
  validarAsignaturaEnPlan,
  validarCarrera,
  validarPlan,
  type AsignaturaEnPlanInput,
  type CarreraInput,
  type ErroresAsignaturaEnPlan,
  type ErroresCarrera,
  type ErroresPlan,
  type PlanInput,
} from './rules';

type Resultado<T, E> = { ok: true; value: T } | { ok: false; errores: E };

interface EstructuraStore {
  carreras: Carrera[];
  planes: PlanEstudio[];
  /** Catálogo de asignaturas: el de `mocks/sga.ts` más las que se crean desde el editor de planes. */
  catalogo: Asignatura[];
  /** Crea (sin `id`) o actualiza una carrera aplicando las reglas de `validarCarrera`. */
  guardarCarrera: (input: CarreraInput, id?: string) => Resultado<Carrera, ErroresCarrera>;
  /** Las carreras no se borran: se inactivan (y se pueden reactivar). */
  cambiarEstadoCarrera: (id: string, estado: EstadoCarrera) => void;
  /** Crea o actualiza los datos de un plan (no sus asignaturas) aplicando `validarPlan`. */
  guardarPlan: (input: PlanInput, id?: string) => Resultado<PlanEstudio, ErroresPlan>;
  /** Vigente ↔ histórico. Rechaza dejar dos planes vigentes en la misma carrera. */
  cambiarEstadoPlan: (id: string, estado: EstadoPlan) => Resultado<PlanEstudio, ErroresPlan>;
  /** Suma una asignatura al plan; si el código no está en el catálogo, la registra ahí. */
  agregarAsignatura: (planId: string, item: AsignaturaEnPlanInput) => Resultado<PlanEstudio, ErroresAsignaturaEnPlan>;
  quitarAsignatura: (planId: string, codigo: string) => void;
}

const EstructuraContext = createContext<EstructuraStore | null>(null);

/** Store en memoria (sin persistencia) de carreras y planes: al recargar vuelve el seed. */
export function EstructuraProvider({ children }: PropsWithChildren) {
  const [carreras, setCarreras] = useState<Carrera[]>(CARRERAS);
  const [planes, setPlanes] = useState<PlanEstudio[]>(PLANES);
  // simplified: las asignaturas nuevas viven solo aquí, sin prerrequisitos (RF3 queda fuera).
  const [extras, setExtras] = useState<Asignatura[]>([]);
  const catalogo = useMemo(() => [...ASIGNATURAS_SGA, ...extras], [extras]);

  const guardarCarrera = useCallback<EstructuraStore['guardarCarrera']>(
    (input, id) => {
      const errores = validarCarrera(input, carreras, id);
      if (Object.keys(errores).length > 0) return { ok: false, errores };

      const value: Carrera = {
        id: id ?? `car-${Date.now().toString(36)}`,
        codigo: input.codigo.trim().toUpperCase(),
        nombre: input.nombre.trim(),
        sedes: input.sedes,
        modalidad: input.modalidad,
        jornada: input.jornada,
        duracionSemestres: input.duracionSemestres,
        estado: carreras.find((c) => c.id === id)?.estado ?? 'activa',
      };
      setCarreras((actuales) => (id ? actuales.map((c) => (c.id === id ? value : c)) : [...actuales, value]));
      return { ok: true, value };
    },
    [carreras],
  );

  const cambiarEstadoCarrera = useCallback<EstructuraStore['cambiarEstadoCarrera']>((id, estado) => {
    setCarreras((actuales) => actuales.map((c) => (c.id === id ? { ...c, estado } : c)));
  }, []);

  const guardarPlan = useCallback<EstructuraStore['guardarPlan']>(
    (input, id) => {
      const errores = validarPlan(input, planes, id);
      if (Object.keys(errores).length > 0) return { ok: false, errores };

      const value: PlanEstudio = {
        id: id ?? `plan-${Date.now().toString(36)}`,
        carreraId: input.carreraId,
        nombre: input.nombre.trim(),
        estado: input.estado,
        asignaturas: planes.find((p) => p.id === id)?.asignaturas ?? [],
      };
      setPlanes((actuales) => (id ? actuales.map((p) => (p.id === id ? value : p)) : [...actuales, value]));
      return { ok: true, value };
    },
    [planes],
  );

  const cambiarEstadoPlan = useCallback<EstructuraStore['cambiarEstadoPlan']>(
    (id, estado) => {
      const plan = planes.find((p) => p.id === id);
      if (!plan) return { ok: false, errores: { estado: 'El plan ya no existe' } };
      return guardarPlan({ carreraId: plan.carreraId, nombre: plan.nombre, estado }, id);
    },
    [planes, guardarPlan],
  );

  const agregarAsignatura = useCallback<EstructuraStore['agregarAsignatura']>(
    (planId, item) => {
      const plan = planes.find((p) => p.id === planId);
      const carrera = carreras.find((c) => c.id === plan?.carreraId);
      if (!plan || !carrera) return { ok: false, errores: { codigo: 'El plan ya no existe' } };

      const errores = validarAsignaturaEnPlan(item, plan, carrera.duracionSemestres);
      if (Object.keys(errores).length > 0) return { ok: false, errores };

      // Si el código ya existe en el catálogo, se reutiliza tal cual (nombre y créditos incluidos).
      const existente = buscarAsignatura(catalogo, item.codigo);
      const codigo = existente?.codigo ?? item.codigo.trim().toUpperCase();
      if (!existente) {
        setExtras((actuales) => [
          ...actuales,
          { codigo, nombre: item.nombre.trim(), creditos: item.creditos, prerrequisitos: [] },
        ]);
      }

      const value: PlanEstudio = {
        ...plan,
        asignaturas: [...plan.asignaturas, { codigo, semestre: item.semestre, tipo: item.tipo }],
      };
      setPlanes((actuales) => actuales.map((p) => (p.id === planId ? value : p)));
      return { ok: true, value };
    },
    [planes, carreras, catalogo],
  );

  const quitarAsignatura = useCallback<EstructuraStore['quitarAsignatura']>((planId, codigo) => {
    setPlanes((actuales) =>
      actuales.map((p) => (p.id === planId ? { ...p, asignaturas: p.asignaturas.filter((a) => a.codigo !== codigo) } : p)),
    );
  }, []);

  const value = useMemo(
    () => ({
      carreras,
      planes,
      catalogo,
      guardarCarrera,
      cambiarEstadoCarrera,
      guardarPlan,
      cambiarEstadoPlan,
      agregarAsignatura,
      quitarAsignatura,
    }),
    [carreras, planes, catalogo, guardarCarrera, cambiarEstadoCarrera, guardarPlan, cambiarEstadoPlan, agregarAsignatura, quitarAsignatura],
  );
  return <EstructuraContext.Provider value={value}>{children}</EstructuraContext.Provider>;
}

export function useEstructura(): EstructuraStore {
  const ctx = useContext(EstructuraContext);
  if (!ctx) throw new Error('useEstructura debe usarse dentro de EstructuraProvider');
  return ctx;
}
