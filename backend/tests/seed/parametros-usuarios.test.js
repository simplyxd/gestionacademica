import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import '../../src/app.js';
import { CLAVE_ADMIN_DESARROLLO, default as sembrar } from '../../../db/seed/01-parametros-usuarios.js';
import { Parametros } from '../../src/models/parametros.model.js';
import { Usuario } from '../../src/models/usuario.model.js';
import { crearContexto } from '../../src/seed/lib.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba } from '../helpers/db.js';

beforeAll(async () => {
  await conectarBaseDePrueba();
  await Usuario.init();
  await Parametros.init();
});

afterAll(desconectarBaseDePrueba);

describe('semilla 01', () => {
  it('crea los parámetros, un admin, un coordinador con sedes y un docente, y se puede correr dos veces', async () => {
    await sembrar(crearContexto());
    await sembrar(crearContexto());

    expect(await Parametros.countDocuments()).toBe(1);
    expect(await Usuario.countDocuments()).toBe(3);

    const coordinador = await Usuario.findOne({ correo: 'coordinador@iunf.cl' });
    expect(coordinador.rol).toBe('coordinador');
    expect(coordinador.sedes).toHaveLength(2);

    const docente = await Usuario.findOne({ correo: 'docente@iunf.cl' });
    expect(docente.rol).toBe('docente');
    expect(docente.sedes).toHaveLength(1);

    const admin = await Usuario.findOne({ correo: 'ADMIN@iunf.cl' }).select('+passwordHash');
    expect(admin.rut).toBe('12345678-5');
    expect(JSON.parse(JSON.stringify(admin))).not.toHaveProperty('passwordHash');
    expect(await bcrypt.compare(CLAVE_ADMIN_DESARROLLO, admin.passwordHash)).toBe(true);
  });
});
