import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { DOCENTES_SEED, ESTUDIANTES_SEED } from '@/mock/personas-academicas';
import { validarPersona, type ErroresPersona } from './rules';
import type { DocentePersona, EstudiantePersona, EstadoPersona, PersonaInput, RolPersona } from './types';

type ResultadoGuardar<T> = { ok: true; value: T } | { ok: false; errores: ErroresPersona };

interface PersonasStore {
  docentes: DocentePersona[];
  estudiantes: EstudiantePersona[];
  /** Solo miembros activos: es lo que se ofrece al asignar docentes en la oferta y al matricular. */
  docentesActivos: DocentePersona[];
  estudiantesActivos: EstudiantePersona[];
  guardarDocente: (input: PersonaInput, id?: string) => ResultadoGuardar<DocentePersona>;
  guardarEstudiante: (input: PersonaInput, id?: string) => ResultadoGuardar<EstudiantePersona>;
  /** Baja lógica: alterna activo/inactivo sin borrar el registro. */
  alternarEstado: (rol: RolPersona, id: string) => EstadoPersona | null;
}

const PersonasContext = createContext<PersonasStore | null>(null);

/** Store en memoria (sin persistencia): al recargar vuelve el seed. */
export function PersonasProvider({ children }: PropsWithChildren) {
  const [docentes, setDocentes] = useState<DocentePersona[]>(DOCENTES_SEED);
  const [estudiantes, setEstudiantes] = useState<EstudiantePersona[]>(ESTUDIANTES_SEED);

  const guardarDocente = useCallback<PersonasStore['guardarDocente']>(
    (input, id) => {
      const errores = validarPersona('docente', input, docentes, id);
      if (Object.keys(errores).length > 0) return { ok: false, errores };
      const previa = id ? docentes.find((d) => d.id === id) : undefined;
      const value: DocentePersona = {
        id: previa?.id ?? `doc-${Date.now().toString(36)}`,
        rut: input.rut.trim(),
        nombres: input.nombres.trim(),
        apellidos: input.apellidos.trim(),
        email: input.email.trim().toLowerCase(),
        telefono: input.telefono.trim(),
        incorporacion: input.incorporacion,
        especialidad: input.especialidad.trim(),
        tipoVinculo: input.tipoVinculo,
        estado: previa?.estado ?? 'activo',
      };
      setDocentes((actuales) => (previa ? actuales.map((d) => (d.id === previa.id ? value : d)) : [value, ...actuales]));
      return { ok: true, value };
    },
    [docentes],
  );

  const guardarEstudiante = useCallback<PersonasStore['guardarEstudiante']>(
    (input, id) => {
      const errores = validarPersona('estudiante', input, estudiantes, id);
      if (Object.keys(errores).length > 0) return { ok: false, errores };
      const previa = id ? estudiantes.find((e) => e.id === id) : undefined;
      const value: EstudiantePersona = {
        id: previa?.id ?? `est-${Date.now().toString(36)}`,
        rut: input.rut.trim(),
        nombres: input.nombres.trim(),
        apellidos: input.apellidos.trim(),
        email: input.email.trim().toLowerCase(),
        telefono: input.telefono.trim(),
        incorporacion: input.incorporacion,
        codigoEstudiante: input.codigoEstudiante.trim().toUpperCase(),
        contactoEmergencia: input.contactoEmergencia.trim(),
        nivelCursando: input.nivelCursando,
        estado: previa?.estado ?? 'activo',
      };
      setEstudiantes((actuales) => (previa ? actuales.map((e) => (e.id === previa.id ? value : e)) : [value, ...actuales]));
      return { ok: true, value };
    },
    [estudiantes],
  );

  const alternarEstado = useCallback<PersonasStore['alternarEstado']>(
    (rol, id) => {
      const lista = rol === 'docente' ? docentes : estudiantes;
      const actual = lista.find((p) => p.id === id);
      if (!actual) return null;
      const nuevo: EstadoPersona = actual.estado === 'activo' ? 'inactivo' : 'activo';
      if (rol === 'docente') setDocentes((l) => l.map((p) => (p.id === id ? { ...p, estado: nuevo } : p)));
      else setEstudiantes((l) => l.map((p) => (p.id === id ? { ...p, estado: nuevo } : p)));
      return nuevo;
    },
    [docentes, estudiantes],
  );

  const value = useMemo<PersonasStore>(
    () => ({
      docentes,
      estudiantes,
      docentesActivos: docentes.filter((d) => d.estado === 'activo'),
      estudiantesActivos: estudiantes.filter((e) => e.estado === 'activo'),
      guardarDocente,
      guardarEstudiante,
      alternarEstado,
    }),
    [docentes, estudiantes, guardarDocente, guardarEstudiante, alternarEstado],
  );

  return <PersonasContext.Provider value={value}>{children}</PersonasContext.Provider>;
}

export function usePersonas(): PersonasStore {
  const ctx = useContext(PersonasContext);
  if (!ctx) throw new Error('usePersonas debe usarse dentro de PersonasProvider');
  return ctx;
}
