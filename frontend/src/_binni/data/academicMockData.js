export const PERIOD_STATUSES = [
  { value: "planning", label: "Planificación" },
  { value: "enrollmentOpen", label: "Inscripción abierta" },
  { value: "inProgress", label: "En curso" },
  { value: "closed", label: "Cerrado" },
]

export const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

export const SUBJECTS = [
  "Ingeniería de Software I",
  "Base de Datos Avanzadas",
  "Liderazgo de Equipos",
  "Matemáticas Discretas",
  "Algoritmos y Estructuras de Datos",
]

export const TEACHERS = [
  "Mario Docente",
  "Carlos Admin",
  "Sofía Coordinadora",
  "Valentina Profesora",
]

export const CAMPUSES = ["Sede Central", "Sede Norte"]

export const SHIFTS = ["Diurna", "Vespertina"]

export const MODALITIES = ["Presencial", "Semipresencial", "Online"]

export const ROOMS = [
  "Aula 302",
  "Aula 204",
  "Laboratorio Informática 1",
  "Sala 210",
  "Auditorio Central",
]

export const INITIAL_PERIODS = [
  {
    id: "2026-1",
    nombre: "2026 · Primer semestre",
    inicio: "2026-03-02",
    termino: "2026-07-18",
    inscripcionInicio: "2026-01-05",
    inscripcionTermino: "2026-02-20",
    estado: "closed",
  },
  {
    id: "2026-2",
    nombre: "2026 · Segundo semestre",
    inicio: "2026-08-03",
    termino: "2026-12-19",
    inscripcionInicio: "2026-06-01",
    inscripcionTermino: "2026-07-15",
    estado: "inProgress",
  },
  {
    id: "2027-1",
    nombre: "2027 · Primer semestre",
    inicio: "2027-03-01",
    termino: "2027-07-17",
    inscripcionInicio: "2027-01-04",
    inscripcionTermino: "2027-02-19",
    estado: "planning",
  },
  {
    id: "2027-2",
    nombre: "2027 · Segundo semestre",
    inicio: "2027-08-02",
    termino: "2027-12-18",
    inscripcionInicio: "2027-06-01",
    inscripcionTermino: "2027-07-16",
    estado: "enrollmentOpen",
  },
]

export const INITIAL_SECTIONS = [
  {
    id: "section-inf-301-01",
    codigo: "INF-301 · Sec 01",
    asignatura: "Ingeniería de Software I",
    docente: "Mario Docente",
    sede: "Sede Central",
    jornada: "Diurna",
    modalidad: "Presencial",
    cupos: 32,
    sala: "Aula 302",
    periodoId: "2026-2",
    bloques: [
      { id: "inf-301-mon", dia: "Lunes", inicio: "08:30", termino: "10:00" },
      { id: "inf-301-wed", dia: "Miércoles", inicio: "08:30", termino: "10:00" },
    ],
  },
  {
    id: "section-inf-302-02",
    codigo: "INF-302 · Sec 02",
    asignatura: "Base de Datos Avanzadas",
    docente: "Carlos Admin",
    sede: "Sede Central",
    jornada: "Vespertina",
    modalidad: "Semipresencial",
    cupos: 28,
    sala: "Laboratorio Informática 1",
    periodoId: "2026-2",
    bloques: [
      { id: "inf-302-tue", dia: "Martes", inicio: "18:00", termino: "19:30" },
      { id: "inf-302-thu", dia: "Jueves", inicio: "18:00", termino: "19:30" },
    ],
  },
  {
    id: "section-lid-101-01",
    codigo: "LID-101 · Sec 01",
    asignatura: "Liderazgo de Equipos",
    docente: "Sofía Coordinadora",
    sede: "Sede Norte",
    jornada: "Diurna",
    modalidad: "Presencial",
    cupos: 36,
    sala: "Auditorio Central",
    periodoId: "2026-2",
    bloques: [
      { id: "lid-101-fri", dia: "Viernes", inicio: "12:00", termino: "13:30" },
    ],
  },
  {
    id: "section-mat-202-01",
    codigo: "MAT-202 · Sec 01",
    asignatura: "Matemáticas Discretas",
    docente: "Valentina Profesora",
    sede: "Sede Central",
    jornada: "Vespertina",
    modalidad: "Online",
    cupos: 45,
    sala: "",
    periodoId: "2026-2",
    bloques: [
      { id: "mat-202-thu", dia: "Jueves", inicio: "20:00", termino: "21:30" },
    ],
  },
]
