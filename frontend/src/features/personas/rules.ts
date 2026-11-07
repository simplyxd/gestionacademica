import dayjs from 'dayjs';
import { isValidRut, rutKey } from '@/lib/rut';
import { NIVELES, TIPOS_VINCULO, type Persona, type PersonaInput, type RolPersona } from './types';

export type ErroresPersona = Partial<Record<keyof PersonaInput, string>>;

/** Campos que aplican a cada rol (los demás del formulario se ignoran). */
export const CAMPOS_DE: Record<RolPersona, (keyof PersonaInput)[]> = {
  docente: ['rut', 'nombres', 'apellidos', 'email', 'telefono', 'incorporacion', 'especialidad', 'tipoVinculo'],
  estudiante: [
    'rut', 'nombres', 'apellidos', 'email', 'telefono', 'incorporacion',
    'codigoEstudiante', 'contactoEmergencia', 'nivelCursando',
  ],
};

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Reglas de una persona (RF5 / CU4): RUT válido y único, correo válido y único, teléfono de 7 a 15 dígitos,
 * incorporación no futura, y los datos propios de cada rol. Devuelve un mensaje por campo; vacío = válido.
 * `existentes` son las personas del mismo rol; `hoy` se inyecta para poder probar la regla de fecha.
 */
export function validarPersona(
  rol: RolPersona,
  input: PersonaInput,
  existentes: readonly Persona[],
  editandoId?: string,
  hoy: string = dayjs().format('YYYY-MM-DD'),
): ErroresPersona {
  const e: ErroresPersona = {};
  const otros = existentes.filter((p) => p.id !== editandoId);

  if (!input.nombres.trim()) e.nombres = 'Ingresa los nombres';
  else if (input.nombres.trim().length > 80) e.nombres = 'Los nombres admiten hasta 80 caracteres';
  if (!input.apellidos.trim()) e.apellidos = 'Ingresa los apellidos';
  else if (input.apellidos.trim().length > 80) e.apellidos = 'Los apellidos admiten hasta 80 caracteres';

  if (!input.rut.trim()) e.rut = 'Ingresa el RUT';
  else if (!isValidRut(input.rut)) e.rut = 'Ingresa un RUT válido, incluido su dígito verificador';
  else if (otros.some((p) => rutKey(p.rut) === rutKey(input.rut))) {
    e.rut = `Ya existe ${rol === 'docente' ? 'un docente' : 'un estudiante'} con ese RUT`;
  }

  if (!input.email.trim()) e.email = 'Ingresa el correo institucional';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) e.email = 'Ingresa un correo válido';
  else if (otros.some((p) => norm(p.email) === norm(input.email))) e.email = 'Ese correo ya pertenece a otra persona';

  const digitos = input.telefono.replace(/\D/g, '');
  if (!input.telefono.trim()) e.telefono = 'Ingresa un teléfono de contacto';
  else if (!/^[+\d\s().-]+$/.test(input.telefono) || digitos.length < 7 || digitos.length > 15) {
    e.telefono = 'Ingresa un teléfono válido (7 a 15 dígitos)';
  }

  if (!input.incorporacion) e.incorporacion = 'Indica la fecha de incorporación';
  else if (input.incorporacion > hoy) e.incorporacion = 'La fecha de incorporación no puede ser futura';

  if (rol === 'docente') {
    if (!input.especialidad.trim()) e.especialidad = 'Indica la especialidad o área';
    if (!TIPOS_VINCULO.includes(input.tipoVinculo as (typeof TIPOS_VINCULO)[number])) {
      e.tipoVinculo = 'Selecciona el tipo de vínculo con la institución';
    }
  } else {
    const codigo = input.codigoEstudiante.trim().toUpperCase();
    if (!codigo) e.codigoEstudiante = 'Ingresa el código de estudiante';
    else if (!/^EST-\d{4}-\d{3}$/.test(codigo)) e.codigoEstudiante = 'Usa el formato EST-AAAA-NNN, por ejemplo EST-2026-014';
    else if (otros.some((p) => 'codigoEstudiante' in p && p.codigoEstudiante.toUpperCase() === codigo)) {
      e.codigoEstudiante = 'Ese código ya pertenece a otro estudiante';
    }
    if (!input.contactoEmergencia.trim()) e.contactoEmergencia = 'Ingresa un contacto de emergencia (nombre y teléfono)';
    if (!NIVELES.includes(input.nivelCursando as (typeof NIVELES)[number])) {
      e.nivelCursando = 'Selecciona el nivel que está cursando';
    }
  }

  return e;
}

export function inputDePersona(p: Persona): PersonaInput {
  return {
    rut: p.rut,
    nombres: p.nombres,
    apellidos: p.apellidos,
    email: p.email,
    telefono: p.telefono,
    incorporacion: p.incorporacion,
    especialidad: 'especialidad' in p ? p.especialidad : '',
    tipoVinculo: 'tipoVinculo' in p ? p.tipoVinculo : '',
    codigoEstudiante: 'codigoEstudiante' in p ? p.codigoEstudiante : '',
    contactoEmergencia: 'contactoEmergencia' in p ? p.contactoEmergencia : '',
    nivelCursando: 'nivelCursando' in p ? p.nivelCursando : '',
  };
}
