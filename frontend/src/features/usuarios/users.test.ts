import { assert, it as test } from 'vitest';
import {
  CARRERAS, DEPARTAMENTOS, ROLES, SEDES, canManageUsers, deactivateUser, emptyFilters,
  filterUsers, getUsers, isValidRut, saveUser, subscribeUsers, validateUser, type UserDraft,
} from './users';

test('ABM mock: permisos, límites, filtros, eventos y baja lógica', () => {
  assert.equal(canManageUsers('admin'), true);
  for (const role of ['coordinador', 'docente', 'estudiante', undefined, '__proto__']) assert.equal(canManageUsers(role), false);
  assert.equal(isValidRut('12.345.678-5'), true);
  assert.equal(isValidRut('12345678-0'), false);
  for (const user of getUsers()) assert.deepEqual(validateUser(user, user.id), {}, `Mock inválido: ${user.nombre}`);
  const draft: UserDraft = {
    nombre: 'Usuario de prueba', rut: '9.876.543-3', rol: 'estudiante', sedes: [...SEDES],
    carreras: CARRERAS.slice(0, 2), departamentos: [], correo: 'prueba@instituto.example', telefono: '+56 9 5555 0199',
  };
  assert.deepEqual(validateUser(draft), {});
  assert.match(validateUser({ ...draft, carreras: CARRERAS.slice(0, 3) }).carreras!, /máximo 2/);
  assert.match(validateUser({ ...draft, sedes: [...SEDES, 'Cuarta'] }).sedes!, /máximo 3/);
  assert.deepEqual(validateUser({ ...draft, rol: 'docente', carreras: [], departamentos: DEPARTAMENTOS.slice(0, 3) }), {});
  assert.match(validateUser({ ...draft, rol: 'docente', departamentos: [...DEPARTAMENTOS] }).departamentos!, /máximo 3/);
  const before = getUsers();
  for (const role of Object.keys(ROLES).filter(role => role !== 'admin')) {
    assert.throws(() => saveUser(draft, role), /administrador/);
    assert.throws(() => saveUser(draft, role, '1'), /administrador/);
    assert.throws(() => deactivateUser('1', role), /administrador/);
  }
  assert.equal(getUsers(), before);
  let notifications = 0;
  const unsubscribe = subscribeUsers(() => notifications++);
  const created = saveUser(draft, 'admin');
  assert.equal(getUsers().length, before.length + 1);
  assert.equal(notifications, 1);
  assert.throws(() => saveUser(draft, 'admin'), /RUT/);
  const edited = saveUser({ ...created, telefono: '+56 9 5555 0200' }, 'admin', created.id);
  assert.equal(edited.id, created.id);
  assert.equal(getUsers().length, before.length + 1);
  assert.equal(getUsers().find(user => user.id === created.id)?.telefono, '+56 9 5555 0200');
  const filters = { ...emptyFilters(), sedes: ['Sede Central', 'Sede Norte'], carreras: [CARRERAS[0]], roles: ['estudiante'], estados: ['activo'] };
  assert.ok(filterUsers(getUsers(), filters).some(user => user.id === created.id));
  assert.ok(filterUsers(getUsers(), filters).every(user => user.rol === 'estudiante' && user.estado === 'activo' && user.carreras.includes(CARRERAS[0]) && user.sedes.some(sede => ['Sede Central', 'Sede Norte'].includes(sede))));
  assert.equal(filterUsers(getUsers(), { ...filters, roles: ['docente'] }).length, 0);
  assert.equal(filterUsers(getUsers(), emptyFilters()).length, getUsers().length);
  deactivateUser(created.id, 'admin');
  assert.equal(getUsers().length, before.length + 1);
  assert.equal(getUsers().find(user => user.id === created.id)?.estado, 'inactivo');
  assert.ok(!filterUsers(getUsers(), filters).some(user => user.id === created.id));
  const inactiveEdited = saveUser({ ...edited, rol: 'docente', departamentos: ['Computación'] }, 'admin', created.id);
  assert.equal(inactiveEdited.estado, 'inactivo');
  assert.deepEqual(inactiveEdited.carreras, []);
  assert.deepEqual(inactiveEdited.departamentos, ['Computación']);
  assert.equal(notifications, 4);
  unsubscribe();
  assert.throws(() => deactivateUser('no-existe', 'admin'), /no existe/);
});
