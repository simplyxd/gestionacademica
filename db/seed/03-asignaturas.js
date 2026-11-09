// Seed de asignaturas (dueño: Lorenzo). Idempotente: clave natural = código.
// 40 asignaturas para las 4 carreras del seed: Informática (INF + MAT), Administración (ADM),
// Técnico en Enfermería (ENF) y Contabilidad y Auditoría (CON). MAT-100 y ADM-110 se comparten entre carreras.
import { Asignatura } from '../../backend/src/models/asignatura.model.js';

export const ASIGNATURAS = [
  // Ciencias básicas
  { codigo: 'MAT-100', nombre: 'Nivelación Matemática', creditos: 5 },
  { codigo: 'MAT-101', nombre: 'Álgebra', creditos: 6 },
  { codigo: 'MAT-201', nombre: 'Cálculo Diferencial', creditos: 6 },
  { codigo: 'MAT-202', nombre: 'Estadística', creditos: 5 },
  // Informática
  { codigo: 'INF-101', nombre: 'Introducción a la Programación', creditos: 6 },
  { codigo: 'INF-105', nombre: 'Fundamentos de Computación', creditos: 5 },
  { codigo: 'INF-201', nombre: 'Programación Orientada a Objetos', creditos: 6 },
  { codigo: 'INF-210', nombre: 'Desarrollo Web', creditos: 5 },
  { codigo: 'INF-220', nombre: 'Estructuras de Datos', creditos: 6 },
  { codigo: 'INF-230', nombre: 'Bases de Datos', creditos: 6 },
  { codigo: 'INF-301', nombre: 'Ingeniería de Software', creditos: 6 },
  { codigo: 'INF-310', nombre: 'Redes de Computadores', creditos: 5 },
  { codigo: 'INF-320', nombre: 'Sistemas Operativos', creditos: 5 },
  { codigo: 'INF-330', nombre: 'Análisis de Algoritmos', creditos: 6 },
  { codigo: 'INF-401', nombre: 'Arquitectura de Software', creditos: 6 },
  { codigo: 'INF-410', nombre: 'Seguridad Informática', creditos: 5 },
  { codigo: 'INF-420', nombre: 'Inteligencia Artificial', creditos: 5 },
  { codigo: 'INF-490', nombre: 'Proyecto de Título', creditos: 10 },
  // Administración
  { codigo: 'ADM-110', nombre: 'Introducción a la Administración', creditos: 5 },
  { codigo: 'ADM-120', nombre: 'Microeconomía', creditos: 5 },
  { codigo: 'ADM-210', nombre: 'Marketing', creditos: 5 },
  { codigo: 'ADM-220', nombre: 'Gestión de Personas', creditos: 5 },
  { codigo: 'ADM-230', nombre: 'Macroeconomía', creditos: 5 },
  { codigo: 'ADM-310', nombre: 'Finanzas Corporativas', creditos: 6 },
  { codigo: 'ADM-320', nombre: 'Gestión de Operaciones', creditos: 5 },
  { codigo: 'ADM-410', nombre: 'Estrategia Empresarial', creditos: 6 },
  // Técnico en Enfermería
  { codigo: 'ENF-101', nombre: 'Anatomía y Fisiología', creditos: 6 },
  { codigo: 'ENF-102', nombre: 'Fundamentos de Enfermería', creditos: 6 },
  { codigo: 'ENF-201', nombre: 'Farmacología', creditos: 5 },
  { codigo: 'ENF-202', nombre: 'Enfermería Médico-Quirúrgica', creditos: 8 },
  { codigo: 'ENF-301', nombre: 'Salud Comunitaria', creditos: 5 },
  { codigo: 'ENF-302', nombre: 'Primeros Auxilios', creditos: 4 },
  { codigo: 'ENF-401', nombre: 'Práctica Clínica I', creditos: 10 },
  { codigo: 'ENF-501', nombre: 'Práctica Profesional', creditos: 15 },
  // Contabilidad y Auditoría
  { codigo: 'CON-101', nombre: 'Contabilidad General', creditos: 6 },
  { codigo: 'CON-201', nombre: 'Contabilidad de Costos', creditos: 6 },
  { codigo: 'CON-301', nombre: 'Tributación', creditos: 6 },
  { codigo: 'CON-302', nombre: 'Auditoría', creditos: 6 },
  { codigo: 'CON-401', nombre: 'Legislación Laboral', creditos: 4 },
  { codigo: 'CON-402', nombre: 'Normas Internacionales de Información Financiera', creditos: 5 },
];

export default async function sembrar({ upsertPorClave, log }) {
  await Asignatura.init();
  for (const { codigo, ...datos } of ASIGNATURAS) {
    await upsertPorClave(Asignatura, { codigo }, datos);
  }
  log(`${ASIGNATURAS.length} asignaturas listas`);
}
