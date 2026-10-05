import { CARRERAS as CARRERAS_SEED } from '@/mock/estructura';
import { formatRut, isValidRut, rutKey } from '@/lib/rut';
import { SEDES as SEDES_SEED } from '@/mock/sedes';

export const ROLES = {
  admin: 'Administrador',
  coordinador: 'Coordinador Académico',
  docente: 'Docente',
  estudiante: 'Estudiante',
} as const;
export type Role = keyof typeof ROLES;
/** Mismos nombres que Sedes y Carreras del coordinador, para que una cuenta apunte a lo que existe. */
export const SEDES = SEDES_SEED.map((s) => s.nombre);
export const CARRERAS = CARRERAS_SEED.map((c) => c.nombre);
export const DEPARTAMENTOS = ['Computación', 'Ciencias Básicas', 'Administración', 'Humanidades'];
export const ESTADOS = [{ value: 'activo', label: 'Activo' }, { value: 'inactivo', label: 'Desactivado' }];

export type UserDraft = {
  nombre: string;
  rut: string;
  rol: Role;
  sedes: string[];
  carreras: string[];
  departamentos: string[];
  correo: string;
  telefono: string;
};
export type User = UserDraft & { id: string; estado: 'activo' | 'inactivo' };
export type Filters = { sedes: string[]; carreras: string[]; roles: string[]; estados: string[] };
export const emptyFilters = (): Filters => ({ sedes: [], carreras: [], roles: [], estados: [] });
export const emptyDraft = (): UserDraft => ({
  nombre: '', rut: '', rol: 'admin', sedes: [], carreras: [], departamentos: [], correo: '', telefono: '',
});

export { isValidRut };

const INITIAL_USERS: User[] = [
  { id: '1', nombre: 'Camila Soto', rut: '12.345.678-5', rol: 'admin', sedes: [...SEDES], carreras: [], departamentos: [], correo: 'camila.soto@instituto.example', telefono: '+56 9 5555 0101', estado: 'activo' },
  { id: '2', nombre: 'Tomás Rojas', rut: '11.111.111-1', rol: 'coordinador', sedes: ['Sede Central', 'Sede Norte'], carreras: [], departamentos: [], correo: 'tomas.rojas@instituto.example', telefono: '+56 9 5555 0102', estado: 'activo' },
  { id: '3', nombre: 'Valentina Díaz', rut: '22.222.222-2', rol: 'docente', sedes: ['Sede Central', 'Sede Sur'], carreras: [], departamentos: ['Computación', 'Ciencias Básicas'], correo: 'valentina.diaz@instituto.example', telefono: '+56 9 5555 0103', estado: 'activo' },
  { id: '4', nombre: 'Diego Muñoz', rut: '13.333.333-9', rol: 'estudiante', sedes: ['Sede Norte'], carreras: ['Ingeniería en Informática'], departamentos: [], correo: 'diego.munoz@instituto.example', telefono: '+56 9 5555 0104', estado: 'activo' },
  { id: '5', nombre: 'Antonia Pérez', rut: '14.444.444-2', rol: 'estudiante', sedes: ['Sede Central', 'Sede Sur'], carreras: ['Administración de Empresas', 'Contabilidad y Auditoría'], departamentos: [], correo: 'antonia.perez@instituto.example', telefono: '+56 9 5555 0105', estado: 'activo' },
  { id: '6', nombre: 'Gabriel Torres', rut: '15.555.555-6', rol: 'docente', sedes: ['Sede Sur'], carreras: [], departamentos: ['Humanidades'], correo: 'gabriel.torres@instituto.example', telefono: '+56 9 5555 0106', estado: 'inactivo' },
  { id: '7', nombre: 'Francisca Vera', rut: '16.666.666-K', rol: 'coordinador', sedes: ['Sede Sur'], carreras: [], departamentos: [], correo: 'francisca.vera@instituto.example', telefono: '+56 9 5555 0107', estado: 'activo' },
];

// simplified: estado en memoria de esta pestaña; un adaptador de API si se autoriza persistencia.
let users: User[] = INITIAL_USERS.map(user => structuredClone(user));
const events = new EventTarget();
export const getUsers = () => users as readonly User[];
export const canManageUsers = (role: unknown) => role === 'admin';
export function subscribeUsers(listener: () => void) {
  events.addEventListener('usuarios:changed', listener);
  return () => events.removeEventListener('usuarios:changed', listener);
}

export function validateUser(draft: UserDraft, editingId?: string) {
  const errors: Partial<Record<keyof UserDraft, string>> = {};
  if (!draft.nombre.trim()) errors.nombre = 'Ingresa el nombre.';
  if (!isValidRut(draft.rut)) errors.rut = 'Ingresa un RUT válido, incluido su dígito verificador.';
  if (!Object.hasOwn(ROLES, draft.rol)) errors.rol = 'Selecciona un rol válido.';
  if (!draft.sedes.length) errors.sedes = 'Selecciona al menos una sede.';
  if ((draft.rol === 'docente' || draft.rol === 'estudiante') && draft.sedes.length > 3) errors.sedes = 'Puedes seleccionar como máximo 3 sedes.';
  if (draft.rol === 'estudiante' && draft.carreras.length > 2) errors.carreras = 'Puedes seleccionar como máximo 2 carreras.';
  if (draft.rol === 'docente' && draft.departamentos.length > 3) errors.departamentos = 'Puedes seleccionar como máximo 3 departamentos.';
  for (const [field, catalog] of [['sedes', SEDES], ['carreras', CARRERAS], ['departamentos', DEPARTAMENTOS]] as const) {
    if (draft[field].some(value => !catalog.includes(value)) || new Set(draft[field]).size !== draft[field].length) {
      errors[field] ??= 'Selecciona valores válidos, sin repetir.';
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.correo.trim())) errors.correo = 'Ingresa un correo válido.';
  const digits = draft.telefono.replace(/\D/g, '');
  if (draft.telefono.trim() && (!/^[+\d\s().-]+$/.test(draft.telefono) || digits.length < 7 || digits.length > 15)) errors.telefono = 'Ingresa un teléfono válido (7 a 15 dígitos).';
  for (const user of users.filter(user => user.id !== editingId)) {
    if (rutKey(user.rut) === rutKey(draft.rut)) errors.rut = 'Este RUT ya pertenece a otra cuenta.';
    if (user.correo.toLowerCase() === draft.correo.trim().toLowerCase()) errors.correo = 'Este correo ya pertenece a otra cuenta.';
  }
  return errors;
}

export function saveUser(draft: UserDraft, actor: unknown, editingId?: string) {
  if (!canManageUsers(actor)) throw new Error('Solo un administrador puede administrar usuarios.');
  const previous = editingId ? users.find(user => user.id === editingId) : undefined;
  if (editingId && !previous) throw new Error('La cuenta que intentas editar no existe.');
  const data: UserDraft = {
    ...draft, nombre: draft.nombre.trim(), rut: draft.rut.trim(), correo: draft.correo.trim().toLowerCase(), telefono: draft.telefono.trim(),
    sedes: [...draft.sedes], carreras: draft.rol === 'estudiante' ? [...draft.carreras] : [], departamentos: draft.rol === 'docente' ? [...draft.departamentos] : [],
  };
  const errors = validateUser(data, editingId);
  if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
  const user: User = { ...data, rut: formatRut(data.rut), id: previous?.id ?? crypto.randomUUID(), estado: previous?.estado ?? 'activo' };
  users = previous ? users.map(current => current.id === user.id ? user : current) : [...users, user];
  events.dispatchEvent(new Event('usuarios:changed'));
  return user;
}

export function deactivateUser(id: string, actor: unknown) {
  if (!canManageUsers(actor)) throw new Error('Solo un administrador puede administrar usuarios.');
  if (!users.some(user => user.id === id)) throw new Error('La cuenta que intentas desactivar no existe.');
  users = users.map(user => user.id === id ? { ...user, estado: 'inactivo' } : user);
  events.dispatchEvent(new Event('usuarios:changed'));
}

export function filterUsers(source: readonly User[], filters: Filters) {
  return source.filter(user =>
    (!filters.sedes.length || user.sedes.some(sede => filters.sedes.includes(sede))) &&
    (!filters.carreras.length || user.carreras.some(carrera => filters.carreras.includes(carrera))) &&
    (!filters.roles.length || filters.roles.includes(user.rol)) &&
    (!filters.estados.length || filters.estados.includes(user.estado)),
  );
}
