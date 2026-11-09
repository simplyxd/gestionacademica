const { crearAzar } = require('./azar');
const { generarHistorial, verificarHistorial } = require('./historial');
const { PLAN_INF_2024 } = require('./fixtures');

describe('generarHistorial', () => {
  it('nivel 1: todavía no aprobó nada', () => {
    expect(generarHistorial(PLAN_INF_2024, 1, crearAzar(1))).toEqual([]);
  });

  it('solo incluye asignaturas de semestres anteriores a su nivel', () => {
    const historial = generarHistorial(PLAN_INF_2024, 2, crearAzar(1), { probabilidad: 1 });
    expect(historial.map((a) => a.codigo).sort()).toEqual(['INF-101', 'MAT-100', 'MAT-101']);
    expect(historial.every((a) => a.semestre === 1)).toBe(true);
  });

  it('con probabilidad 1 aprueba todo lo habilitado hasta nivel - 1', () => {
    const historial = generarHistorial(PLAN_INF_2024, 4, crearAzar(1), { probabilidad: 1 });
    expect(historial).toHaveLength(PLAN_INF_2024.length);
  });

  it('con probabilidad 0 no aprueba nada', () => {
    expect(generarHistorial(PLAN_INF_2024, 4, crearAzar(1), { probabilidad: 0 })).toEqual([]);
  });

  it('un prerrequisito del mismo semestre no habilita la asignatura en ese semestre', () => {
    const plan = [
      { codigo: 'A', semestre: 1, prerrequisitos: [] },
      { codigo: 'B', semestre: 1, prerrequisitos: ['A'] },
    ];
    expect(generarHistorial(plan, 2, crearAzar(1), { probabilidad: 1 }).map((a) => a.codigo)).toEqual(['A']);
  });

  it('es reproducible con la misma semilla', () => {
    const a = generarHistorial(PLAN_INF_2024, 4, crearAzar(99));
    const b = generarHistorial(PLAN_INF_2024, 4, crearAzar(99));
    expect(a).toEqual(b);
  });
});

describe('verificarHistorial', () => {
  it('sin problemas devuelve una lista vacía', () => {
    expect(verificarHistorial(['MAT-100', 'MAT-201'], PLAN_INF_2024)).toEqual([]);
  });

  it('detecta una asignatura aprobada sin su prerrequisito', () => {
    expect(verificarHistorial(['MAT-201'], PLAN_INF_2024)).toEqual([
      { codigo: 'MAT-201', motivo: 'prerrequisito_faltante', faltan: ['MAT-100'] },
    ]);
  });

  it('detecta una asignatura que no es del plan', () => {
    expect(verificarHistorial(['ADM-110'], PLAN_INF_2024)).toEqual([{ codigo: 'ADM-110', motivo: 'fuera_del_plan' }]);
  });
});

describe('consistencia de 200 historiales generados', () => {
  it('ningún historial aprueba algo sin sus prerrequisitos', () => {
    const azar = crearAzar(2026);
    for (let i = 0; i < 200; i += 1) {
      const nivel = azar.entero(1, 4);
      const codigos = generarHistorial(PLAN_INF_2024, nivel, azar).map((a) => a.codigo);
      expect(verificarHistorial(codigos, PLAN_INF_2024)).toEqual([]);
    }
  });
});
