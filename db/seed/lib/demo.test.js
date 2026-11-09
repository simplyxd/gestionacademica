const { ALUMNOS_DEMO } = require('./demo');
const { verificarHistorial } = require('./historial');
const { PLAN_INF_2024, PLAN_ADM_2023 } = require('./fixtures');

const PLANES = { 'INF/2024': PLAN_INF_2024, 'ADM/2023': PLAN_ADM_2023 };
const porClave = Object.fromEntries(ALUMNOS_DEMO.map((a) => [a.clave, a]));
const aprobadas = (clave) => porClave[clave].aprobadas;
const planDe = (alumno) => PLANES[`${alumno.matricula.carrera}/${alumno.matricula.plan}`];

describe('alumnos reservados para la demo (D-12)', () => {
  it('existen los 6 casos acordados con correo único', () => {
    expect(Object.keys(porClave).sort()).toEqual(
      ['choque', 'feliz', 'otroplan', 'sinmatricula', 'sinprerrequisito', 'yaaprobo'].sort(),
    );
    expect(new Set(ALUMNOS_DEMO.map((a) => a.email)).size).toBe(ALUMNOS_DEMO.length);
  });

  it('cada caso apunta a la regla que demuestra', () => {
    expect(porClave.sinmatricula.regla).toBe(1);
    expect(porClave.otroplan.regla).toBe(4);
    expect(porClave.sinprerrequisito.regla).toBe(5);
    expect(porClave.yaaprobo.regla).toBe(6);
    expect(porClave.choque.regla).toBe(7);
    expect(porClave.feliz.regla).toBeNull();
  });

  it('tienen perfil de estudiante completo', () => {
    for (const alumno of ALUMNOS_DEMO) {
      expect(alumno.perfilEstudiante.codigoEstudiante).toMatch(/^EST-\d{4}-\d{3}$/);
      expect(alumno.perfilEstudiante.contactoEmergencia).not.toBe('');
      expect(Number.isInteger(alumno.perfilEstudiante.nivelCursando)).toBe(true);
    }
  });

  it('regla 1: no tiene matrícula', () => {
    expect(porClave.sinmatricula.matricula).toBeNull();
  });

  it('regla 4: su matrícula es de otro plan que no contiene la asignatura que intenta', () => {
    const alumno = porClave.otroplan;
    expect(planDe(alumno).map((a) => a.codigo)).not.toContain(alumno.intenta);
  });

  it('regla 5: le falta el prerrequisito de lo que intenta', () => {
    const alumno = porClave.sinprerrequisito;
    const { prerrequisitos } = planDe(alumno).find((a) => a.codigo === alumno.intenta);
    expect(prerrequisitos.some((p) => !aprobadas('sinprerrequisito').includes(p))).toBe(true);
  });

  it('regla 6: ya aprobó lo que intenta', () => {
    expect(aprobadas('yaaprobo')).toContain(porClave.yaaprobo.intenta);
  });

  it('feliz y choque cumplen los prerrequisitos de lo que intentan y no la aprobaron antes', () => {
    for (const clave of ['feliz', 'choque']) {
      const alumno = porClave[clave];
      const { prerrequisitos } = planDe(alumno).find((a) => a.codigo === alumno.intenta);
      expect(prerrequisitos.every((p) => alumno.aprobadas.includes(p))).toBe(true);
      expect(alumno.aprobadas).not.toContain(alumno.intenta);
    }
  });

  it('todos los historiales de demo son coherentes con su plan', () => {
    for (const alumno of ALUMNOS_DEMO.filter((a) => a.matricula)) {
      expect(verificarHistorial(alumno.aprobadas, planDe(alumno))).toEqual([]);
    }
  });
});
