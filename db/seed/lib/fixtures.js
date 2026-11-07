/**
 * Plan Informática 2024 del prototipo (frontend/src/mock), con los prerrequisitos en el plan.
 * Solo para tests: el plan real lo siembra Lorenzo (05-planes).
 */
const PLAN_INF_2024 = [
  { codigo: 'MAT-100', semestre: 1, prerrequisitos: [] },
  { codigo: 'MAT-101', semestre: 1, prerrequisitos: [] },
  { codigo: 'INF-101', semestre: 1, prerrequisitos: [] },
  { codigo: 'MAT-201', semestre: 2, prerrequisitos: ['MAT-100'] },
  { codigo: 'INF-105', semestre: 2, prerrequisitos: [] },
  { codigo: 'INF-201', semestre: 2, prerrequisitos: ['INF-101'] },
  { codigo: 'INF-301', semestre: 3, prerrequisitos: ['INF-201'] },
  { codigo: 'INF-210', semestre: 3, prerrequisitos: [] },
];

const PLAN_ADM_2023 = [
  { codigo: 'ADM-110', semestre: 1, prerrequisitos: [] },
  { codigo: 'MAT-100', semestre: 1, prerrequisitos: [] },
];

module.exports = { PLAN_INF_2024, PLAN_ADM_2023 };
