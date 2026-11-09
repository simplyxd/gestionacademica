import bcrypt from 'bcryptjs';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import '../../src/app.js';
import { Usuario } from '../../src/models/usuario.model.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

// El plugin global (app.js) es el que saca passwordHash de toJSON porque el campo tiene select:false.

const HASH_DE_RELLENO = '$2a$12$relleno.relleno.relleno.relleno.relleno.relleno.rellen';

function cuenta(parcial = {}) {
  return {
    rut: '12345678-5',
    nombre: 'Ana Pérez',
    correo: 'ana@duoc.cl',
    telefono: '+56 9 5555 0199',
    passwordHash: HASH_DE_RELLENO,
    rol: 'admin',
    incorporacion: '2024-03-01',
    ...parcial,
  };
}

function perfilEstudiante(codigo) {
  return {
    codigoEstudiante: codigo,
    contactoEmergencia: 'María Pérez',
    nivelCursando: 1,
  };
}

beforeAll(async () => {
  await conectarBaseDePrueba();
  await Usuario.init();
});

afterEach(limpiarBase);
afterAll(desconectarBaseDePrueba);

describe('Usuario', () => {
  it('guarda el RUT canónico y el correo en minúsculas, sin espacios', async () => {
    const doc = await Usuario.create(cuenta({ rut: '12.345.678-5', correo: '  Ana@DUOC.cl ' }));

    expect(doc.rut).toBe('12345678-5');
    expect(doc.correo).toBe('ana@duoc.cl');
  });

  it('busca con la misma forma: puntos en el RUT y mayúsculas en el correo', async () => {
    await Usuario.create(cuenta({ rut: '16.666.666-K', correo: 'ana@duoc.cl' }));

    const hallado = await Usuario.findOne({ rut: '16666666-k', correo: '  ANA@duoc.cl ' });

    expect(hallado).not.toBeNull();
    expect(hallado.rut).toBe('16666666-K');
  });

  it('no guarda un RUT cuyo dígito verificador no calza', async () => {
    await expect(Usuario.create(cuenta({ rut: '12.345.678-4' }))).rejects.toThrow(/dígito verificador/);
  });

  it('rechaza un RUT repetido desde el índice único', async () => {
    await Usuario.create(cuenta());

    await expect(Usuario.create(cuenta({ correo: 'otra@duoc.cl' }))).rejects.toMatchObject({ code: 11000 });
  });

  it('rechaza un correo repetido aunque entre con otras mayúsculas', async () => {
    await Usuario.create(cuenta({ correo: 'ana@duoc.cl' }));

    await expect(Usuario.create(cuenta({ rut: '11111111-1', correo: 'ANA@duoc.cl' }))).rejects.toMatchObject({ code: 11000 });
  });

  it('rechaza un codigoEstudiante repetido y deja pasar a quien no tiene ese campo', async () => {
    await Usuario.create(cuenta({ rol: 'estudiante', perfilEstudiante: perfilEstudiante('EST-2026-001') }));
    await Usuario.create(cuenta({ rut: '11111111-1', correo: 'admin2@duoc.cl', rol: 'admin' }));
    await Usuario.create(cuenta({ rut: '16666666-K', correo: 'coord@duoc.cl', rol: 'coordinador' }));

    await expect(
      Usuario.create(cuenta({
        rut: '22222222-2',
        correo: 'otro@duoc.cl',
        rol: 'estudiante',
        perfilEstudiante: perfilEstudiante('EST-2026-001'),
      })),
    ).rejects.toMatchObject({ code: 11000 });

    const sinCodigo = await Usuario.countDocuments({ 'perfilEstudiante.codigoEstudiante': { $exists: false } });
    expect(sinCodigo).toBe(2);
  });

  it('toJSON nunca devuelve passwordHash, y la clave queda como bcrypt con costo 12', async () => {
    const doc = await Usuario.create(cuenta());
    await doc.fijarClave('Clave-Dev-Admin-2026');
    await doc.save();

    expect(JSON.parse(JSON.stringify(doc))).not.toHaveProperty('passwordHash');

    const recargado = await Usuario.findById(doc._id).select('+passwordHash');
    expect(recargado.passwordHash).toMatch(/^\$2[aby]\$12\$/);
    expect(JSON.parse(JSON.stringify(recargado))).not.toHaveProperty('passwordHash');
    expect(await bcrypt.compare('Clave-Dev-Admin-2026', recargado.passwordHash)).toBe(true);
  });

  it('no guarda un docente que trae perfil de estudiante', async () => {
    await expect(
      Usuario.create(cuenta({
        rol: 'docente',
        perfilEstudiante: perfilEstudiante('EST-2026-002'),
      })),
    ).rejects.toThrow(/docente no puede tener perfil de estudiante/);

    expect(await Usuario.countDocuments()).toBe(0);
  });
});
