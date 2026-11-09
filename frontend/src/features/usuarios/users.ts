import { ROL_LABEL, type Rol } from '@/app/navigation';
import { motivoClave } from '@/features/auth/clave';
import { ApiError } from '@/lib/api';
import { isValidRut } from '@/lib/rut';

export const ROLES_USUARIO: { value: Rol; label: string }[] = (Object.keys(ROL_LABEL) as Rol[]).map((value) => ({
  value,
  label: ROL_LABEL[value],
}));

export const ESTADOS_USUARIO = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Desactivado' },
] as const;

export const TIPOS_VINCULO = ['planta', 'contrata', 'honorarios'] as const;
export type TipoVinculo = (typeof TIPOS_VINCULO)[number];

export const ETIQUETA_VINCULO: Record<TipoVinculo, string> = {
  planta: 'Planta',
  contrata: 'Contrata',
  honorarios: 'Honorarios',
};

export const NIVELES = Array.from({ length: 8 }, (_, i) => ({
  value: String(i + 1),
  label: `Nivel ${i + 1}`,
}));

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODIGO = /^EST-\d{4}-\d{3}$/;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

export interface OpcionSede {
  id: string;
  nombre: string;
}

export interface PerfilDocente {
  especialidad: string;
  tipoVinculo: TipoVinculo;
  departamentos: string[];
}

export interface PerfilEstudiante {
  codigoEstudiante: string;
  contactoEmergencia: string;
  nivelCursando: number;
}

export interface UsuarioLista {
  id: string;
  nombre: string;
  rut: string;
  correo: string;
  telefono: string;
  rol: Rol;
  sedes: OpcionSede[];
  estado: 'activo' | 'inactivo';
  incorporacion: string;
  perfilDocente: PerfilDocente | null;
  perfilEstudiante: PerfilEstudiante | null;
}

export interface BorradorUsuario {
  nombre: string;
  rut: string;
  correo: string;
  telefono: string;
  rol: Rol;
  sedes: string[];
  incorporacion: string;
  password: string;
  confirmacion: string;
  especialidad: string;
  tipoVinculo: string;
  departamentos: string[];
  codigoEstudiante: string;
  contactoEmergencia: string;
  nivelCursando: string;
}

export interface CuerpoUsuario {
  nombre: string;
  rut: string;
  correo: string;
  telefono: string;
  rol: Rol;
  sedes: string[];
  incorporacion: string;
  perfilDocente: PerfilDocente | null;
  perfilEstudiante: { codigoEstudiante: string; contactoEmergencia: string; nivelCursando: number } | null;
  /** El alta la espera el servidor en `clave`. En la edición no se envía. */
  clave?: string;
}

export function esAbort(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AbortError';
}

export function esTipoVinculo(valor: string): valor is TipoVinculo {
  return (TIPOS_VINCULO as readonly string[]).includes(valor);
}

export function borradorVacio(): BorradorUsuario {
  return {
    nombre: '',
    rut: '',
    correo: '',
    telefono: '',
    rol: 'admin',
    sedes: [],
    incorporacion: '',
    password: '',
    confirmacion: '',
    especialidad: '',
    tipoVinculo: '',
    departamentos: [],
    codigoEstudiante: '',
    contactoEmergencia: '',
    nivelCursando: '',
  };
}

function fechaValida(iso: string): boolean {
  if (!FECHA.test(iso)) return false;
  const [anio, mes, dia] = iso.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return fecha.getUTCFullYear() === anio && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia;
}

export function limpiarDepartamentos(lista: readonly string[]): string[] {
  const vistos = new Set<string>();
  const salida: string[] = [];
  for (const item of lista) {
    const texto = item.trim();
    if (!texto) continue;
    const clave = texto.toLocaleLowerCase('es');
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    salida.push(texto);
  }
  return salida;
}

export function validarBorrador(borrador: BorradorUsuario, modo: 'crear' | 'editar'): Partial<Record<keyof BorradorUsuario, string>> {
  const errores: Partial<Record<keyof BorradorUsuario, string>> = {};
  if (!borrador.nombre.trim()) errores.nombre = 'Ingresa el nombre.';
  else if (borrador.nombre.trim().length > 120) errores.nombre = 'El nombre puede tener hasta 120 caracteres.';
  if (!isValidRut(borrador.rut)) errores.rut = 'Ingresa un RUT válido, incluido su dígito verificador.';
  if (!CORREO.test(borrador.correo.trim())) errores.correo = 'Ingresa un correo válido.';
  const telefono = borrador.telefono.trim();
  if (telefono) {
    const digitos = telefono.replace(/\D/g, '');
    if (!/^[+\d\s().-]+$/.test(telefono) || digitos.length < 7 || digitos.length > 15 || telefono.length > 30) {
      errores.telefono = 'Ingresa un teléfono válido (7 a 15 dígitos).';
    }
  }
  if (!borrador.sedes.length) errores.sedes = 'Selecciona al menos una sede.';
  else if (new Set(borrador.sedes).size !== borrador.sedes.length) errores.sedes = 'No repitas la misma sede.';
  if (!fechaValida(borrador.incorporacion)) errores.incorporacion = 'Ingresa la fecha de incorporación.';

  if (modo === 'crear') {
    if (!borrador.password) errores.password = 'Ingresa una contraseña inicial.';
    else {
      const motivo = motivoClave(borrador.password);
      if (motivo) errores.password = motivo;
    }
    if (!borrador.confirmacion) errores.confirmacion = 'Repite la contraseña inicial.';
    else if (borrador.password && borrador.confirmacion !== borrador.password) errores.confirmacion = 'Las contraseñas no coinciden.';
  }

  if (borrador.rol === 'docente') {
    if (borrador.especialidad.trim().length > 120) errores.especialidad = 'La especialidad puede tener hasta 120 caracteres.';
    if (!esTipoVinculo(borrador.tipoVinculo)) errores.tipoVinculo = 'Selecciona el tipo de vínculo.';
    const departamentos = limpiarDepartamentos(borrador.departamentos);
    if (departamentos.some((departamento) => departamento.length > 120)) {
      errores.departamentos = 'Cada departamento puede tener hasta 120 caracteres.';
    }
  }

  if (borrador.rol === 'estudiante') {
    const codigo = borrador.codigoEstudiante.trim().toUpperCase();
    if (!codigo) errores.codigoEstudiante = 'Ingresa el código de estudiante.';
    else if (!CODIGO.test(codigo)) errores.codigoEstudiante = 'Usa el formato EST-AAAA-NNN, por ejemplo EST-2026-014.';
    if (!borrador.contactoEmergencia.trim()) errores.contactoEmergencia = 'Ingresa el contacto de emergencia.';
    else if (borrador.contactoEmergencia.trim().length > 120) errores.contactoEmergencia = 'El contacto puede tener hasta 120 caracteres.';
    const nivel = Number(borrador.nivelCursando);
    if (!Number.isInteger(nivel) || nivel < 1 || nivel > 8) errores.nivelCursando = 'Selecciona un nivel del 1 al 8.';
  }

  return errores;
}

export function cuerpoDeUsuario(borrador: BorradorUsuario, modo: 'crear' | 'editar'): CuerpoUsuario {
  const cuerpo: CuerpoUsuario = {
    nombre: borrador.nombre.trim(),
    rut: borrador.rut.trim(),
    correo: borrador.correo.trim(),
    telefono: borrador.telefono.trim(),
    rol: borrador.rol,
    sedes: [...borrador.sedes],
    incorporacion: borrador.incorporacion,
    perfilDocente: null,
    perfilEstudiante: null,
  };
  if (borrador.rol === 'docente' && esTipoVinculo(borrador.tipoVinculo)) {
    cuerpo.perfilDocente = {
      especialidad: borrador.especialidad.trim(),
      tipoVinculo: borrador.tipoVinculo,
      departamentos: limpiarDepartamentos(borrador.departamentos),
    };
  }
  if (borrador.rol === 'estudiante') {
    cuerpo.perfilEstudiante = {
      codigoEstudiante: borrador.codigoEstudiante.trim().toUpperCase(),
      contactoEmergencia: borrador.contactoEmergencia.trim(),
      nivelCursando: Number(borrador.nivelCursando),
    };
  }
  if (modo === 'crear') cuerpo.clave = borrador.password;
  return cuerpo;
}

export function leerSede(valor: unknown): OpcionSede | null {
  if (typeof valor === 'string' && valor.trim()) return { id: valor, nombre: valor };
  if (!valor || typeof valor !== 'object') return null;
  const dato = valor as { id?: unknown; _id?: unknown; nombre?: unknown };
  const id = typeof dato.id === 'string' ? dato.id : typeof dato._id === 'string' ? dato._id : '';
  if (!id) return null;
  const nombre = typeof dato.nombre === 'string' && dato.nombre.trim() ? dato.nombre.trim() : id;
  return { id, nombre };
}

export function normalizarSedes(data: unknown): OpcionSede[] {
  if (!Array.isArray(data)) return [];
  return data.map(leerSede).filter((sede): sede is OpcionSede => sede !== null);
}

function leerPerfilDocente(valor: unknown): PerfilDocente | null {
  if (!valor || typeof valor !== 'object') return null;
  const dato = valor as Record<string, unknown>;
  const tipo = typeof dato.tipoVinculo === 'string' ? dato.tipoVinculo : '';
  if (!esTipoVinculo(tipo)) return null;
  const departamentos = Array.isArray(dato.departamentos)
    ? dato.departamentos.filter((item): item is string => typeof item === 'string')
    : [];
  return {
    especialidad: typeof dato.especialidad === 'string' ? dato.especialidad : '',
    tipoVinculo: tipo,
    departamentos,
  };
}

function leerPerfilEstudiante(valor: unknown): PerfilEstudiante | null {
  if (!valor || typeof valor !== 'object') return null;
  const dato = valor as Record<string, unknown>;
  const codigo = typeof dato.codigoEstudiante === 'string' ? dato.codigoEstudiante.trim().toUpperCase() : '';
  const contacto = typeof dato.contactoEmergencia === 'string' ? dato.contactoEmergencia : '';
  const nivel = typeof dato.nivelCursando === 'number' ? dato.nivelCursando : Number(dato.nivelCursando);
  if (!codigo || !Number.isInteger(nivel)) return null;
  return { codigoEstudiante: codigo, contactoEmergencia: contacto, nivelCursando: nivel };
}

export function normalizarUsuarioLista(raw: unknown): UsuarioLista | null {
  if (!raw || typeof raw !== 'object') return null;
  const dato = raw as Record<string, unknown>;
  const id = typeof dato.id === 'string' ? dato.id : typeof dato._id === 'string' ? dato._id : '';
  const nombre = typeof dato.nombre === 'string' ? dato.nombre : '';
  const rol = dato.rol;
  if (!id || !nombre || (rol !== 'admin' && rol !== 'coordinador' && rol !== 'docente' && rol !== 'estudiante')) return null;
  if (dato.estado !== 'activo' && dato.estado !== 'inactivo') return null;
  const sedes = Array.isArray(dato.sedes) ? dato.sedes.map(leerSede).filter((sede): sede is OpcionSede => sede !== null) : [];
  return {
    id,
    nombre,
    rut: typeof dato.rut === 'string' ? dato.rut : '',
    correo: typeof dato.correo === 'string' ? dato.correo : '',
    telefono: typeof dato.telefono === 'string' ? dato.telefono : '',
    rol,
    sedes,
    estado: dato.estado,
    incorporacion: typeof dato.incorporacion === 'string' ? dato.incorporacion.slice(0, 10) : '',
    perfilDocente: leerPerfilDocente(dato.perfilDocente),
    perfilEstudiante: leerPerfilEstudiante(dato.perfilEstudiante),
  };
}

export function normalizarListado(data: unknown): UsuarioLista[] {
  if (!Array.isArray(data)) return [];
  return data.map(normalizarUsuarioLista).filter((usuario): usuario is UsuarioLista => usuario !== null);
}

export function borradorDe(usuario: UsuarioLista): BorradorUsuario {
  return {
    ...borradorVacio(),
    nombre: usuario.nombre,
    rut: usuario.rut,
    correo: usuario.correo,
    telefono: usuario.telefono,
    rol: usuario.rol,
    sedes: usuario.sedes.map((sede) => sede.id),
    incorporacion: usuario.incorporacion,
    especialidad: usuario.perfilDocente?.especialidad ?? '',
    tipoVinculo: usuario.perfilDocente?.tipoVinculo ?? '',
    departamentos: usuario.perfilDocente?.departamentos ?? [],
    codigoEstudiante: usuario.perfilEstudiante?.codigoEstudiante ?? '',
    contactoEmergencia: usuario.perfilEstudiante?.contactoEmergencia ?? '',
    nivelCursando: usuario.perfilEstudiante ? String(usuario.perfilEstudiante.nivelCursando) : '',
  };
}

export function textoPerfil(usuario: UsuarioLista): string {
  if (usuario.rol === 'docente' && usuario.perfilDocente) {
    const partes = [
      usuario.perfilDocente.especialidad,
      ETIQUETA_VINCULO[usuario.perfilDocente.tipoVinculo],
      usuario.perfilDocente.departamentos.join(', '),
    ].filter(Boolean);
    return partes.join(' · ') || '—';
  }
  if (usuario.rol === 'estudiante' && usuario.perfilEstudiante) {
    const contacto = usuario.perfilEstudiante.contactoEmergencia;
    const base = `${usuario.perfilEstudiante.codigoEstudiante} · Nivel ${usuario.perfilEstudiante.nivelCursando}`;
    return contacto ? `${base} · ${contacto}` : base;
  }
  return '—';
}

export function rangoPagina(pagina: number, limite: number, total: number): { desde: number; hasta: number } {
  if (total <= 0) return { desde: 0, hasta: 0 };
  const desde = (pagina - 1) * limite + 1;
  const hasta = Math.min(pagina * limite, total);
  return { desde, hasta };
}

/** La clave temporal viaja una sola vez en la respuesta. No se guarda. */
export function leerClaveTemporal(data: unknown): string | null {
  if (typeof data === 'string' && data.trim()) return data;
  if (!data || typeof data !== 'object') return null;
  const dato = data as Record<string, unknown>;
  for (const campo of ['claveTemporal', 'clave', 'password']) {
    const valor = dato[campo];
    if (typeof valor === 'string' && valor.trim()) return valor;
  }
  return null;
}

/** Traduce `details.campos` del contrato ({ campo, motivo }) a errores del formulario. */
export function erroresDeApi(error: ApiError): Partial<Record<keyof BorradorUsuario, string>> {
  const details = error.details;
  if (!details || typeof details !== 'object') return {};
  const campos = (details as { campos?: unknown }).campos;
  if (!Array.isArray(campos)) return {};
  const salida: Partial<Record<keyof BorradorUsuario, string>> = {};
  for (const item of campos) {
    if (!item || typeof item !== 'object') continue;
    const campo = (item as { campo?: unknown }).campo;
    const motivo = (item as { motivo?: unknown }).motivo;
    if (typeof campo !== 'string') continue;
    const ultimo = campo.split('.').at(-1);
    const hoja = ultimo === 'clave' ? 'password' : ultimo;
    if (!hoja || !(hoja in borradorVacio())) continue;
    const texto = typeof motivo === 'string' && motivo.trim() ? motivo.trim() : 'no es válido';
    const frase = texto.charAt(0).toUpperCase() + texto.slice(1);
    salida[hoja as keyof BorradorUsuario] = frase.endsWith('.') ? frase : `${frase}.`;
  }
  return salida;
}
