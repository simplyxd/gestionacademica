import type { Matricula } from '@/features/matricula/types';

/**
 * Seed de matrículas. Solo hay una `vigente` por estudiante y período.
 * Los estudiantes est-007…est-012 no tienen matrícula: sirven para probar el alta.
 */
export const MATRICULAS_SEED: Matricula[] = [
  { id: 'MAT-0001', estudianteId: 'est-001', carreraId: 'car-inf', planId: 'plan-inf-2024', periodoId: 'per-2026-1', estado: 'vigente', creadaEn: '2026-03-02T10:00:00.000Z' },
  { id: 'MAT-0002', estudianteId: 'est-001', carreraId: 'car-inf', planId: 'plan-inf-2024', periodoId: 'per-2026-2', estado: 'vigente', creadaEn: '2026-08-03T10:00:00.000Z' },
  { id: 'MAT-0003', estudianteId: 'est-002', carreraId: 'car-inf', planId: 'plan-inf-2019', periodoId: 'per-2026-2', estado: 'suspendida', creadaEn: '2026-08-03T10:20:00.000Z' },
  { id: 'MAT-0004', estudianteId: 'est-003', carreraId: 'car-adm', planId: 'plan-adm-2023', periodoId: 'per-2026-2', estado: 'vigente', creadaEn: '2026-08-04T09:00:00.000Z' },
  { id: 'MAT-0005', estudianteId: 'est-004', carreraId: 'car-enf', planId: 'plan-enf-2022', periodoId: 'per-2026-2', estado: 'retirada', creadaEn: '2026-08-04T09:30:00.000Z' },
  { id: 'MAT-0006', estudianteId: 'est-005', carreraId: 'car-con', planId: 'plan-con-2023', periodoId: 'per-2026-2', estado: 'vigente', creadaEn: '2026-08-05T11:00:00.000Z' },
  { id: 'MAT-0007', estudianteId: 'est-006', carreraId: 'car-inf', planId: 'plan-inf-2019', periodoId: 'per-2026-1', estado: 'egresada', creadaEn: '2026-03-02T10:30:00.000Z' },
];
