import { describe, it, expect } from 'vitest';
import * as ENUMS from '../../src/constants/enums.js';

// Contrato transversal de asignacion-juan.md: los enums viajan en ASCII (sin tildes ni espacios).
// Esta tabla es la copia de referencia; si el contrato cambia, se cambia aquí y en enums.js a la vez.
const ESPERADO = {
  ROLES: ['admin', 'coordinador', 'docente', 'estudiante'],
  ESTADOS_USUARIO: ['activo', 'inactivo'],
  ESTADOS_SEDE: ['activa', 'en_mantenimiento', 'inactiva'],
  ESTADOS_CARRERA: ['activa', 'inactiva'],
  ESTADOS_PLAN: ['vigente', 'historico'],
  TIPOS_ASIGNATURA_EN_PLAN: ['obligatoria', 'electiva'],
  ESTADOS_PERIODO: ['planificacion', 'inscripcion_abierta', 'en_curso', 'cerrado'],
  ESTADOS_MATRICULA: ['vigente', 'suspendida', 'egresada', 'retirada'],
  MODALIDADES: ['presencial', 'semipresencial', 'online'],
  JORNADAS: ['diurna', 'vespertina'], // catálogo abierto: lo cierra el grupo
  ESTADOS_SECCION: ['abierta', 'cerrada', 'cancelada'],
  ESTADOS_INSCRIPCION: ['activa', 'anulada'],
};

describe('constants/enums', () => {
  it('exporta exactamente los enums del contrato, ni más ni menos', () => {
    expect(Object.keys(ENUMS).sort()).toEqual(Object.keys(ESPERADO).sort());
  });

  describe.each(Object.entries(ESPERADO))('%s', (nombre, valores) => {
    it('tiene los valores del contrato', () => {
      expect(ENUMS[nombre], `falta el enum ${nombre}`).toBeDefined();
      expect(Object.values(ENUMS[nombre])).toEqual(valores);
    });

    it('usa solo minúsculas ASCII y guion bajo, sin tildes ni espacios', () => {
      for (const valor of Object.values(ENUMS[nombre] ?? {})) {
        expect(valor).toMatch(/^[a-z]+(_[a-z]+)*$/);
      }
    });

    it('nombra cada clave como su valor en mayúsculas (ROLES.ADMIN === "admin")', () => {
      for (const [clave, valor] of Object.entries(ENUMS[nombre] ?? {})) {
        expect(clave).toBe(valor.toUpperCase());
      }
    });

    it('está congelado: nadie puede modificarlo en tiempo de ejecución', () => {
      expect(Object.isFrozen(ENUMS[nombre])).toBe(true);
    });
  });
});
