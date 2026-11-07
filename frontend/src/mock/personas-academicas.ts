import type { DocentePersona, EstudiantePersona } from '@/features/personas/types';
import { DOCENTES } from './docentes';
import { ESTUDIANTES, rut } from './personas';

/**
 * Seed de «Docentes y estudiantes» (RF5 / CU4). Parte de los MISMOS nombres que ya usan la Oferta y la
 * Matrícula, para que una baja o un alta se note en esas pantallas. Incluye un docente y un estudiante
 * inactivos (de Ángel) para ver la baja lógica.
 */

const ESPECIALIDAD: Record<string, string> = {
  'doc-fuentes': 'Matemáticas',
  'doc-riquelme': 'Matemáticas',
  'doc-ortiz': 'Informática',
  'doc-araya': 'Informática',
  'doc-henriquez': 'Administración',
  'doc-vera': 'Redes y sistemas',
  'doc-pinto': 'Ciencias básicas',
};

const VINCULO = ['Tiempo completo', 'Media jornada', 'Por horas'];

const sinTildes = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export const DOCENTES_SEED: DocentePersona[] = [
  ...DOCENTES.map<DocentePersona>((d, i) => {
    const [nombres, ...resto] = d.nombre.split(' ');
    const apellidos = resto.join(' ');
    return {
      id: d.id,
      rut: rut(12_300_000 + i * 713_457),
      nombres,
      apellidos,
      email: `${sinTildes(nombres)}.${sinTildes(apellidos)}@nuevaformacion.cl`,
      telefono: `+56 9 5500 01${String(i + 1).padStart(2, '0')}`,
      incorporacion: `${2019 + (i % 6)}-0${(i % 8) + 1}-15`,
      especialidad: ESPECIALIDAD[d.id] ?? 'Docencia general',
      tipoVinculo: VINCULO[i % VINCULO.length],
      estado: 'activo',
    };
  }),
  {
    id: 'doc-mendez',
    rut: rut(9_876_543),
    nombres: 'Carlos',
    apellidos: 'Méndez',
    email: 'carlos.mendez@nuevaformacion.cl',
    telefono: '+56 9 5500 0199',
    incorporacion: '2021-08-15',
    especialidad: 'Bases de datos',
    tipoVinculo: 'Por horas',
    estado: 'inactivo',
  },
];

export const ESTUDIANTES_SEED: EstudiantePersona[] = [
  ...ESTUDIANTES.map<EstudiantePersona>((e, i) => ({
    id: e.id,
    rut: e.rut,
    nombres: e.nombres,
    apellidos: e.apellidos,
    email: e.email,
    telefono: `+56 9 5600 02${String(i + 1).padStart(2, '0')}`,
    incorporacion: i < 6 ? '2025-03-03' : '2026-03-02',
    codigoEstudiante: `EST-${i < 6 ? 2025 : 2026}-${String(i + 1).padStart(3, '0')}`,
    contactoEmergencia: `Contacto de ${e.nombres} · +56 9 5700 03${String(i + 1).padStart(2, '0')}`,
    nivelCursando: `Nivel ${(i % 4) + 1}`,
    estado: 'activo',
  })),
  {
    id: 'est-mruiz',
    rut: rut(20_555_111),
    nombres: 'Mateo',
    apellidos: 'Ruiz',
    email: 'mateo.ruiz@alumnos.nuevaformacion.cl',
    telefono: '+56 9 5600 0299',
    incorporacion: '2024-07-20',
    codigoEstudiante: 'EST-2024-044',
    contactoEmergencia: 'Juan Ruiz · +56 9 5700 0399',
    nivelCursando: 'Nivel 2',
    estado: 'inactivo',
  },
];
