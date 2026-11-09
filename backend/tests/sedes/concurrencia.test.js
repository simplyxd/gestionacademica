import '../../src/config/mongoose.js';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Carrera } from '../../src/models/carrera.model.js';
import { Sede } from '../../src/models/sede.model.js';
import * as carreras from '../../src/services/carreras.service.js';
import * as sedes from '../../src/services/sedes.service.js';
import { admin, iniciarModelos } from '../estructura/fixtures.js';
import { conectarBaseDePrueba, desconectarBaseDePrueba, limpiarBase } from '../helpers/db.js';

// Carrera: «inactivar una sede» y «asignarle una carrera activa» validan y luego escriben documentos DISTINTOS.
// Sin bloqueo, las dos leen un estado limpio y las dos se confirman: queda una carrera activa en una sede inactiva.
// Con el bloqueo por sede, una espera a la otra, ve su resultado y se rechaza con su propio 422.

const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
const original = sedes.dependencias.contarSeccionesAbiertas;

beforeAll(async () => {
  await conectarBaseDePrueba();
  await iniciarModelos();
  // Ensancha la ventana: la inactivación tarda 300 ms entre validar y escribir.
  sedes.dependencias.contarSeccionesAbiertas = async () => {
    await pausa(300);
    return 0;
  };
});
afterEach(limpiarBase);
afterAll(async () => {
  sedes.dependencias.contarSeccionesAbiertas = original;
  await desconectarBaseDePrueba();
});

const nuevaCarrera = (sedeId) => ({ codigo: 'ENF', nombre: 'Enfermería', sedes: [sedeId], modalidad: 'presencial', jornada: 'diurna', duracionSemestres: 5 });

describe('concurrencia sede ↔ carrera', () => {
  it.each(['inactivar primero', 'crear carrera primero'])('nunca deja una carrera activa en una sede inactiva (%s)', async (orden) => {
    const sede = await Sede.create({ nombre: 'Sede Norte', direccion: 'Calle 1', comuna: 'Antofagasta' });
    const id = sede._id.toString();

    const inactivar = () => sedes.cambiarEstado(admin, id, 'inactiva');
    const crear = () => pausa(orden === 'inactivar primero' ? 50 : 0).then(() => carreras.crear(admin, nuevaCarrera(id)));
    const [a, b] = await Promise.allSettled(orden === 'inactivar primero' ? [inactivar(), crear()] : [crear(), inactivar()]);

    // Exactamente una gana; la otra recibe el 422 de su propia regla.
    expect([a, b].filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const rechazo = [a, b].find((r) => r.status === 'rejected').reason;
    expect(rechazo.status).toBe(422);
    expect(['SED_CON_DEPENDENCIAS', 'CAR_SEDE_NO_DISPONIBLE']).toContain(rechazo.code);

    const estadoSede = (await Sede.findById(id)).estado;
    const activas = await Carrera.countDocuments({ sedes: sede._id, estado: 'activa' });
    expect(estadoSede === 'inactiva' && activas > 0).toBe(false);
  });

  it('reabrir una carrera y cerrar su sede a la vez tampoco deja el par inválido', async () => {
    const sede = await Sede.create({ nombre: 'Sede Sur', direccion: 'Calle 2', comuna: 'Concepción' });
    const carrera = await Carrera.create({ ...nuevaCarrera(sede._id), estado: 'inactiva' });
    carreras.dependencias.contarMatriculas = async () => 0;

    await Promise.allSettled([sedes.cambiarEstado(admin, sede._id.toString(), 'inactiva'), pausa(50).then(() => carreras.cambiarEstado(admin, carrera._id.toString(), 'activa'))]);

    const estadoSede = (await Sede.findById(sede._id)).estado;
    const estadoCarrera = (await Carrera.findById(carrera._id)).estado;
    expect(estadoSede === 'inactiva' && estadoCarrera === 'activa').toBe(false);
  });
});
