const { crearAzar } = require('./azar');
const { generarDocentes, generarEstudiantes } = require('./personas');
const { isValidRut, rutKey } = require('./rut');

const unicos = (lista) => new Set(lista).size === lista.length;

describe('generarDocentes', () => {
  const docentes = generarDocentes(20, crearAzar(1));

  it('genera 20 docentes activos con perfil docente válido', () => {
    expect(docentes).toHaveLength(20);
    for (const d of docentes) {
      expect(d.rol).toBe('docente');
      expect(d.estado).toBe('activo');
      expect(['planta', 'contrata', 'honorarios']).toContain(d.perfilDocente.tipoVinculo);
      expect(d).not.toHaveProperty('perfilEstudiante');
    }
  });

  it('usa correos institucionales', () => {
    expect(docentes.every((d) => d.email.endsWith('@nuevaformacion.cl'))).toBe(true);
  });
});

describe('generarEstudiantes', () => {
  const estudiantes = generarEstudiantes(200, crearAzar(1));

  it('genera 200 estudiantes activos con perfil de estudiante válido', () => {
    expect(estudiantes).toHaveLength(200);
    for (const e of estudiantes) {
      expect(e.rol).toBe('estudiante');
      expect(e.perfilEstudiante.codigoEstudiante).toMatch(/^EST-\d{4}-\d{3}$/);
      expect(Number.isInteger(e.perfilEstudiante.nivelCursando)).toBe(true);
      expect(e.perfilEstudiante.contactoEmergencia).not.toBe('');
      expect(e).not.toHaveProperty('perfilDocente');
    }
  });

  it('códigos de estudiante únicos', () => {
    expect(unicos(estudiantes.map((e) => e.perfilEstudiante.codigoEstudiante))).toBe(true);
  });

  it('usa correos de alumnos', () => {
    expect(estudiantes.every((e) => e.email.endsWith('@alumnos.nuevaformacion.cl'))).toBe(true);
  });
});

describe('docentes y estudiantes juntos', () => {
  const personas = [...generarDocentes(20, crearAzar(1)), ...generarEstudiantes(200, crearAzar(1))];

  it('RUT válidos y únicos entre todos', () => {
    expect(personas.every((p) => isValidRut(p.rut))).toBe(true);
    expect(unicos(personas.map((p) => rutKey(p.rut)))).toBe(true);
  });

  it('correos únicos entre todos', () => {
    expect(unicos(personas.map((p) => p.email))).toBe(true);
  });

  it('es reproducible con la misma semilla', () => {
    expect(generarEstudiantes(5, crearAzar(9))).toEqual(generarEstudiantes(5, crearAzar(9)));
  });
});
