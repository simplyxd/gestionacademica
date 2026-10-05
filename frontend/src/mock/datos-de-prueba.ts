/**
 * Datos de prueba del prototipo: casos listos para probar a mano (qué escribir y qué debería pasar).
 * Nada de esto se importa desde la app; `datos-de-prueba.test.ts` comprueba que cada caso se comporte como dice.
 *
 * Cómo usarlo: cambia de perfil desde el menú de usuario («Probar como…»), ve a la ruta del caso y copia los datos.
 * Todo vive en memoria: al recargar la página vuelve el seed.
 */
import type { SedeInput } from '@/features/estructura/rules';
import type { SeccionInput } from '@/features/oferta/reglasOferta';
import type { PeriodoInput } from '@/features/periodos/rules';

const h = (hh: number, mm = 0) => hh * 60 + mm;

/** Qué se espera de una sección: guardarse, o ser rechazada por campos inválidos y/o choques. */
export type EsperadoSeccion =
  | { resultado: 'ok' }
  | { resultado: 'rechazada'; campos?: (keyof SeccionInput)[]; choques?: ('docente' | 'sala')[] };

export interface CasoSeccion {
  id: string;
  titulo: string;
  perfil: 'coordinador';
  ruta: '/coordinador/oferta';
  /** Si se indica, es una edición de esa sección del seed; si no, es «Nueva sección». */
  editaSeccionId?: string;
  datos: SeccionInput;
  esperado: EsperadoSeccion;
}

/** Base válida: INF-101 con Rodrigo Fuentes los viernes por la tarde (libre en el seed). */
const SECCION_VALIDA: SeccionInput = {
  codigoAsignatura: 'INF-101',
  docente: 'Rodrigo Fuentes',
  sede: 'Sede Central',
  jornada: 'vespertina',
  modalidad: 'presencial',
  cupo: 30,
  sala: 'Sala 101',
  periodoId: 'per-2026-2',
  bloques: [{ dia: 4, inicioMin: h(16), finMin: h(17, 30) }],
};

export const CASOS_SECCION: CasoSeccion[] = [
  {
    id: 'seccion-ok',
    titulo: 'Sección válida: se crea y aparece también en la oferta del Estudiante',
    perfil: 'coordinador',
    ruta: '/coordinador/oferta',
    datos: SECCION_VALIDA,
    esperado: { resultado: 'ok' },
  },
  {
    id: 'seccion-choque-docente',
    titulo: 'Choque de docente: Rodrigo Fuentes ya dicta Álgebra (MAT-100 A) el martes 11:45–13:15',
    perfil: 'coordinador',
    ruta: '/coordinador/oferta',
    datos: { ...SECCION_VALIDA, sala: 'Sala 206', bloques: [{ dia: 1, inicioMin: h(12), finMin: h(13) }] },
    esperado: { resultado: 'rechazada', choques: ['docente'] },
  },
  {
    id: 'seccion-choque-sala',
    titulo: 'Choque de sala: otro docente, pero la Sala 101 está ocupada por Álgebra el martes',
    perfil: 'coordinador',
    ruta: '/coordinador/oferta',
    datos: { ...SECCION_VALIDA, docente: 'Paula Henríquez', bloques: [{ dia: 1, inicioMin: h(12), finMin: h(13) }] },
    esperado: { resultado: 'rechazada', choques: ['sala'] },
  },
  {
    id: 'seccion-choque-doble',
    titulo: 'Los dos choques a la vez (mismo docente y misma sala)',
    perfil: 'coordinador',
    ruta: '/coordinador/oferta',
    datos: { ...SECCION_VALIDA, bloques: [{ dia: 1, inicioMin: h(12), finMin: h(13) }] },
    esperado: { resultado: 'rechazada', choques: ['docente', 'sala'] },
  },
  {
    id: 'seccion-online-sin-sala',
    titulo: 'Online no pide sala y no choca por sala (aunque el tramo coincida con otra sección)',
    perfil: 'coordinador',
    ruta: '/coordinador/oferta',
    datos: {
      ...SECCION_VALIDA,
      docente: 'Paula Henríquez',
      modalidad: 'online',
      sala: '',
      bloques: [{ dia: 1, inicioMin: h(12), finMin: h(13) }],
    },
    esperado: { resultado: 'ok' },
  },
  {
    id: 'seccion-sin-sala-presencial',
    titulo: 'Presencial sin sala: se pide la sala',
    perfil: 'coordinador',
    ruta: '/coordinador/oferta',
    datos: { ...SECCION_VALIDA, sala: '' },
    esperado: { resultado: 'rechazada', campos: ['sala'] },
  },
  {
    id: 'seccion-fuera-de-grilla',
    titulo: 'Bloque fuera de la grilla 08:00–22:00 (empieza a las 07:00)',
    perfil: 'coordinador',
    ruta: '/coordinador/oferta',
    datos: { ...SECCION_VALIDA, bloques: [{ dia: 4, inicioMin: h(7), finMin: h(9) }] },
    esperado: { resultado: 'rechazada', campos: ['bloques'] },
  },
  {
    id: 'seccion-termino-antes-que-inicio',
    titulo: 'Bloque que termina antes de empezar',
    perfil: 'coordinador',
    ruta: '/coordinador/oferta',
    datos: { ...SECCION_VALIDA, bloques: [{ dia: 4, inicioMin: h(17), finMin: h(16) }] },
    esperado: { resultado: 'rechazada', campos: ['bloques'] },
  },
  {
    id: 'seccion-sin-bloques',
    titulo: 'Sin bloques horarios (en pantalla el último bloque no se puede quitar; la regla igual lo rechaza)',
    perfil: 'coordinador',
    ruta: '/coordinador/oferta',
    datos: { ...SECCION_VALIDA, bloques: [] },
    esperado: { resultado: 'rechazada', campos: ['bloques'] },
  },
  {
    id: 'seccion-cupo-bajo-inscritos',
    titulo: 'Editar Álgebra A (18 inscritos) y bajar el cupo a 10: no se puede bajar de lo ya inscrito',
    perfil: 'coordinador',
    ruta: '/coordinador/oferta',
    editaSeccionId: 'sec-mat100-a',
    datos: {
      codigoAsignatura: 'MAT-100',
      docente: 'Rodrigo Fuentes',
      sede: 'Sede Central',
      jornada: 'diurna',
      modalidad: 'presencial',
      cupo: 10,
      sala: 'Sala 101',
      periodoId: 'per-2026-2',
      bloques: [{ dia: 1, inicioMin: h(11, 45), finMin: h(13, 15) }],
    },
    esperado: { resultado: 'rechazada', campos: ['cupo'] },
  },
  {
    id: 'seccion-cupo-cero',
    titulo: 'Cupo 0',
    perfil: 'coordinador',
    ruta: '/coordinador/oferta',
    datos: { ...SECCION_VALIDA, cupo: 0 },
    esperado: { resultado: 'rechazada', campos: ['cupo'] },
  },
];

export interface CasoPeriodo {
  id: string;
  titulo: string;
  perfil: 'coordinador';
  ruta: '/periodos';
  /** Si se indica, es una edición de ese período del seed; si no, es «Crear período». */
  editaPeriodoId?: string;
  datos: PeriodoInput;
  /** Campos que deben salir con error; vacío = se guarda. */
  camposConError: (keyof PeriodoInput)[];
}

const PERIODO_VALIDO: PeriodoInput = {
  codigo: '2027-2',
  nombre: '2027 · Segundo semestre',
  inicio: '2027-08-02',
  termino: '2027-12-18',
  inscripcionInicio: '2027-06-01',
  inscripcionTermino: '2027-07-16',
  estado: 'planificación',
};

export const CASOS_PERIODO: CasoPeriodo[] = [
  { id: 'periodo-ok', titulo: 'Período válido (la inscripción abre antes del inicio académico)', perfil: 'coordinador', ruta: '/periodos', datos: PERIODO_VALIDO, camposConError: [] },
  { id: 'periodo-codigo-repetido', titulo: 'Código que ya existe (2026-2)', perfil: 'coordinador', ruta: '/periodos', datos: { ...PERIODO_VALIDO, codigo: '2026-2' }, camposConError: ['codigo'] },
  { id: 'periodo-codigo-formato', titulo: 'Código con formato incorrecto', perfil: 'coordinador', ruta: '/periodos', datos: { ...PERIODO_VALIDO, codigo: '27-2' }, camposConError: ['codigo'] },
  { id: 'periodo-dos-en-curso', titulo: 'Segundo período «en curso» (ya lo está 2026-2)', perfil: 'coordinador', ruta: '/periodos', datos: { ...PERIODO_VALIDO, estado: 'en curso' }, camposConError: ['estado'] },
  { id: 'periodo-fechas-invertidas', titulo: 'Término antes del inicio, en el período y en la ventana de inscripción', perfil: 'coordinador', ruta: '/periodos', datos: { ...PERIODO_VALIDO, termino: '2027-07-01', inscripcionTermino: '2027-05-01' }, camposConError: ['termino', 'inscripcionTermino'] },
  { id: 'periodo-vacio', titulo: 'Todo vacío', perfil: 'coordinador', ruta: '/periodos', datos: { ...PERIODO_VALIDO, codigo: '', nombre: '', inicio: '', termino: '', inscripcionInicio: '', inscripcionTermino: '' }, camposConError: ['codigo', 'nombre', 'inicio', 'termino', 'inscripcionInicio', 'inscripcionTermino'] },
  {
    id: 'periodo-editar-en-curso',
    titulo: 'Editar 2026-2 sin tocar su estado: no cuenta como segundo «en curso»',
    perfil: 'coordinador',
    ruta: '/periodos',
    editaPeriodoId: 'per-2026-2',
    datos: { ...PERIODO_VALIDO, codigo: '2026-2', nombre: '2026 · Segundo semestre (editado)', estado: 'en curso', inicio: '2026-08-03', termino: '2026-12-19', inscripcionInicio: '2026-06-01', inscripcionTermino: '2026-07-15' },
    camposConError: [],
  },
];

export interface CasoSede {
  id: string;
  titulo: string;
  perfil: 'coordinador';
  ruta: '/estructura/sedes';
  editaSedeId?: string;
  datos: SedeInput;
  camposConError: (keyof SedeInput)[];
}

const SEDE_VALIDA: SedeInput = { nombre: 'Sede Providencia', direccion: 'Av. Providencia 1234', comuna: 'Santiago', estado: 'activa' };

export const CASOS_SEDE: CasoSede[] = [
  { id: 'sede-ok', titulo: 'Sede válida', perfil: 'coordinador', ruta: '/estructura/sedes', datos: SEDE_VALIDA, camposConError: [] },
  { id: 'sede-nombre-repetido', titulo: 'Nombre repetido sin importar mayúsculas («sede NORTE»)', perfil: 'coordinador', ruta: '/estructura/sedes', datos: { ...SEDE_VALIDA, nombre: 'sede NORTE' }, camposConError: ['nombre'] },
  { id: 'sede-vacia', titulo: 'Sin dirección ni comuna', perfil: 'coordinador', ruta: '/estructura/sedes', datos: { ...SEDE_VALIDA, direccion: '', comuna: '' }, camposConError: ['direccion', 'comuna'] },
  { id: 'sede-editar-misma', titulo: 'Editar Sede Norte conservando su nombre: no es duplicado', perfil: 'coordinador', ruta: '/estructura/sedes', editaSedeId: 'sede-norte', datos: { nombre: 'Sede Norte', direccion: 'Camino Costero 800', comuna: 'Antofagasta', estado: 'en mantenimiento' }, camposConError: [] },
];

/** Recorridos manuales entre pantallas (no son datos de formulario): qué hacer y qué debería verse. */
export interface Recorrido {
  perfil: 'admin' | 'coordinador' | 'docente' | 'estudiante';
  ruta: string;
  pasos: string;
  esperado: string;
}

export const RECORRIDOS: Recorrido[] = [
  {
    perfil: 'coordinador',
    ruta: '/coordinador/oferta',
    pasos: 'Crea la sección «seccion-ok» y luego entra como Estudiante.',
    esperado: 'En /oferta del Estudiante aparece INF-101 sección A (viernes 16:00–17:30), con 0 de 30 inscritos.',
  },
  {
    perfil: 'coordinador',
    ruta: '/coordinador/oferta',
    pasos: 'Crea la sección «seccion-ok» y luego entra como Docente (Rodrigo Fuentes).',
    esperado: 'En «Mis secciones» y «Mi horario» aparece la sección nueva junto a Álgebra.',
  },
  {
    perfil: 'coordinador',
    ruta: '/periodos',
    pasos: 'Crea el período «periodo-ok» y abre /matricula o el selector de período de la oferta.',
    esperado: 'El período 2027-2 aparece en esos selectores; en la oferta aparece sin secciones.',
  },
  {
    perfil: 'coordinador',
    ruta: '/periodos',
    pasos: 'Edita 2026-2 y cámbialo a «cerrado»; luego abre /coordinador/oferta.',
    esperado: 'Ya no hay período en curso en el encabezado; «Nueva sección» y editar quedan deshabilitados en 2026-2.',
  },
  {
    perfil: 'coordinador',
    ruta: '/estructura/sedes',
    pasos: 'Inactiva «Sede Norte» y abre «Nueva sección».',
    esperado: 'Sede Norte ya no se ofrece en el selector de sede (Sede Sur, en mantenimiento, tampoco).',
  },
  {
    perfil: 'estudiante',
    ruta: '/horario',
    pasos: 'Cambia el «Escenario de prueba» del encabezado (sin matrícula, ventana cerrada…).',
    esperado: 'Al inscribir se rechaza nombrando la regla que falla (ver `features/inscripcion/reglas.ts`).',
  },
  {
    perfil: 'admin',
    ruta: '/admin/permisos',
    pasos: 'Marca una casilla y pulsa «Guardar cambios»; sal y vuelve a la pantalla.',
    esperado: 'El cambio se conserva mientras no recargues. La columna Administrador está bloqueada.',
  },
];
