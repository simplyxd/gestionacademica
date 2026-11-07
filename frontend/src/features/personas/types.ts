export type RolPersona = 'docente' | 'estudiante';
export type EstadoPersona = 'activo' | 'inactivo';

export const TIPOS_VINCULO = ['Tiempo completo', 'Media jornada', 'Por horas', 'Honorarios'] as const;
export const NIVELES = ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Nivel 5', 'Nivel 6', 'Nivel 7', 'Nivel 8'] as const;

interface PersonaBase {
  id: string;
  /** `12.345.678-5`. Único dentro de su tipo. */
  rut: string;
  nombres: string;
  apellidos: string;
  /** Correo institucional. Único dentro de su tipo. */
  email: string;
  telefono: string;
  /** ISO `YYYY-MM-DD`. */
  incorporacion: string;
  /** Baja lógica: `inactivo` = ya no figura como miembro activo; el registro se conserva. */
  estado: EstadoPersona;
}

export interface DocentePersona extends PersonaBase {
  especialidad: string;
  tipoVinculo: string;
}

export interface EstudiantePersona extends PersonaBase {
  /** `EST-2025-001`. Único. */
  codigoEstudiante: string;
  contactoEmergencia: string;
  nivelCursando: string;
}

export type Persona = DocentePersona | EstudiantePersona;

/** Campos del formulario (todos texto). Los de docente y estudiante conviven; cada rol usa los suyos. */
export interface PersonaInput {
  rut: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  incorporacion: string;
  especialidad: string;
  tipoVinculo: string;
  codigoEstudiante: string;
  contactoEmergencia: string;
  nivelCursando: string;
}

export const PERSONA_VACIA: PersonaInput = {
  rut: '',
  nombres: '',
  apellidos: '',
  email: '',
  telefono: '',
  incorporacion: '',
  especialidad: '',
  tipoVinculo: '',
  codigoEstudiante: '',
  contactoEmergencia: '',
  nivelCursando: '',
};
