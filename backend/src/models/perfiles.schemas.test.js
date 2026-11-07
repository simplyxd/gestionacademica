const mongoose = require('mongoose');
const {
  perfilDocenteSchema,
  perfilEstudianteSchema,
  validarPerfilSegunRol,
  MAX_APROBADAS,
} = require('./perfiles.schemas');

const PerfilDocente = mongoose.model('PerfilDocentePrueba', perfilDocenteSchema);
const PerfilEstudiante = mongoose.model('PerfilEstudiantePrueba', perfilEstudianteSchema);

const id = () => new mongoose.Types.ObjectId();
const errorDe = (doc) => doc.validate().then(() => null, (e) => e);
const errores = async (doc) => Object.keys((await errorDe(doc))?.errors ?? {}).sort();

const docenteValido = { tipoVinculo: 'planta' };
const estudianteValido = {
  codigoEstudiante: 'EST-2026-001',
  contactoEmergencia: 'María Pérez +56 9 1234 5678',
  nivelCursando: 3,
};

describe('validarPerfilSegunRol', () => {
  const perfilDocente = docenteValido;
  const perfilEstudiante = estudianteValido;

  it.each([
    ['docente', {}],
    ['docente', { perfilDocente }],
    ['estudiante', {}],
    ['estudiante', { perfilEstudiante }],
    ['admin', {}],
    ['coordinador', {}],
  ])('acepta %s con %o', (rol, perfiles) => {
    expect(validarPerfilSegunRol({ rol, ...perfiles })).toBeNull();
  });

  it.each([
    ['docente', { perfilEstudiante }, /docente.*perfil de estudiante/i],
    ['docente', { perfilDocente, perfilEstudiante }, /docente.*perfil de estudiante/i],
    ['estudiante', { perfilDocente }, /estudiante.*perfil docente/i],
    ['estudiante', { perfilDocente, perfilEstudiante }, /estudiante.*perfil docente/i],
    ['admin', { perfilDocente }, /admin.*perfil/i],
    ['admin', { perfilEstudiante }, /admin.*perfil/i],
    ['coordinador', { perfilDocente }, /coordinador.*perfil/i],
    ['coordinador', { perfilEstudiante }, /coordinador.*perfil/i],
  ])('rechaza %s con %o', (rol, perfiles, motivo) => {
    expect(validarPerfilSegunRol({ rol, ...perfiles })).toMatch(motivo);
  });

  it('trata null como perfil ausente', () => {
    expect(validarPerfilSegunRol({ rol: 'docente', perfilDocente: null, perfilEstudiante: null })).toBeNull();
  });

  it('rechaza un rol desconocido', () => {
    expect(validarPerfilSegunRol({ rol: 'invitado' })).toMatch(/rol/i);
  });
});

describe('perfilDocenteSchema', () => {
  it('solo exige tipoVinculo', async () => {
    expect(await errores(new PerfilDocente(docenteValido))).toEqual([]);
    expect(await errores(new PerfilDocente({}))).toEqual(['tipoVinculo']);
  });

  it.each(['planta', 'contrata', 'honorarios'])('acepta tipoVinculo %s', async (tipoVinculo) => {
    expect(await errores(new PerfilDocente({ tipoVinculo }))).toEqual([]);
  });

  it('rechaza un tipoVinculo fuera del catálogo', async () => {
    expect(await errores(new PerfilDocente({ tipoVinculo: 'Tiempo completo' }))).toEqual(['tipoVinculo']);
  });

  it('departamentos es una lista vacía por defecto', () => {
    expect(new PerfilDocente(docenteValido).departamentos.toObject()).toEqual([]);
  });
});

describe('perfilEstudianteSchema', () => {
  it('exige código, contacto de emergencia y nivel', async () => {
    expect(await errores(new PerfilEstudiante(estudianteValido))).toEqual([]);
    expect(await errores(new PerfilEstudiante({}))).toEqual(['codigoEstudiante', 'contactoEmergencia', 'nivelCursando']);
  });

  it('normaliza el código a mayúsculas y exige el formato EST-AAAA-NNN', async () => {
    const normalizado = new PerfilEstudiante({ ...estudianteValido, codigoEstudiante: ' est-2026-014 ' });
    expect(normalizado.codigoEstudiante).toBe('EST-2026-014');
    const malo = new PerfilEstudiante({ ...estudianteValido, codigoEstudiante: 'EST-26-1' });
    expect(await errores(malo)).toEqual(['codigoEstudiante']);
  });

  it.each([0, 9, 2.5])('rechaza nivelCursando %s (entero de 1 a 8)', async (nivelCursando) => {
    expect(await errores(new PerfilEstudiante({ ...estudianteValido, nivelCursando }))).toEqual(['nivelCursando']);
  });

  it('aprobadas es una lista vacía por defecto', () => {
    expect(new PerfilEstudiante(estudianteValido).aprobadas.toObject()).toEqual([]);
  });

  it('permite la misma asignatura en períodos distintos', async () => {
    const asignaturaId = id();
    const aprobadas = [
      { asignaturaId, periodoId: id() },
      { asignaturaId, periodoId: id() },
    ];
    expect(await errores(new PerfilEstudiante({ ...estudianteValido, aprobadas }))).toEqual([]);
  });

  it('rechaza el mismo par asignatura + período repetido', async () => {
    const par = { asignaturaId: id(), periodoId: id() };
    const error = await errorDe(new PerfilEstudiante({ ...estudianteValido, aprobadas: [par, { ...par }] }));
    expect(Object.keys(error.errors)).toEqual(['aprobadas']);
    expect(error.errors.aprobadas.message).toMatch(/repetida/i);
  });

  it(`rechaza más de ${MAX_APROBADAS} aprobadas`, async () => {
    const aprobadas = Array.from({ length: MAX_APROBADAS + 1 }, () => ({ asignaturaId: id(), periodoId: id() }));
    expect(await errores(new PerfilEstudiante({ ...estudianteValido, aprobadas }))).toEqual(['aprobadas']);
  });

  it('exige asignaturaId y periodoId en cada aprobada', async () => {
    const doc = new PerfilEstudiante({ ...estudianteValido, aprobadas: [{}] });
    expect(await errores(doc)).toEqual(['aprobadas.0.asignaturaId', 'aprobadas.0.periodoId']);
  });
});
