import type { Estudiante } from './types';

/** Dígito verificador del RUT chileno (módulo 11). */
function dv(cuerpo: number): string {
  let suma = 0;
  let factor = 2;
  for (const d of String(cuerpo).split('').reverse()) {
    suma += Number(d) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const resto = 11 - (suma % 11);
  return resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
}

function rut(cuerpo: number): string {
  const miles = String(cuerpo).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${miles}-${dv(cuerpo)}`;
}

/** Personas ficticias. Ningún dato corresponde a personas reales. */
export const ESTUDIANTES: Estudiante[] = [
  { id: 'est-001', rut: rut(21456789), nombres: 'Valentina', apellidos: 'Rojas Medina', email: 'valentina.rojas@alumnos.nuevaformacion.cl' },
  { id: 'est-002', rut: rut(20987654), nombres: 'Matías', apellidos: 'Soto Lagos', email: 'matias.soto@alumnos.nuevaformacion.cl' },
  { id: 'est-003', rut: rut(21234567), nombres: 'Camila', apellidos: 'Núñez Vera', email: 'camila.nunez@alumnos.nuevaformacion.cl' },
  { id: 'est-004', rut: rut(20765432), nombres: 'Joaquín', apellidos: 'Pizarro Díaz', email: 'joaquin.pizarro@alumnos.nuevaformacion.cl' },
  { id: 'est-005', rut: rut(21567890), nombres: 'Francisca', apellidos: 'Araya Bustos', email: 'francisca.araya@alumnos.nuevaformacion.cl' },
  { id: 'est-006', rut: rut(20123456), nombres: 'Diego', apellidos: 'Contreras Silva', email: 'diego.contreras@alumnos.nuevaformacion.cl' },
  { id: 'est-007', rut: rut(21890123), nombres: 'Tomás', apellidos: 'Herrera Muñoz', email: 'tomas.herrera@alumnos.nuevaformacion.cl' },
  { id: 'est-008', rut: rut(21345678), nombres: 'Antonia', apellidos: 'Vidal Court', email: 'antonia.vidal@alumnos.nuevaformacion.cl' },
  { id: 'est-009', rut: rut(20654321), nombres: 'Sebastián', apellidos: 'Mora Fuentes', email: 'sebastian.mora@alumnos.nuevaformacion.cl' },
  { id: 'est-010', rut: rut(21678901), nombres: 'Javiera', apellidos: 'Castillo Ortiz', email: 'javiera.castillo@alumnos.nuevaformacion.cl' },
  { id: 'est-011', rut: rut(20432109), nombres: 'Nicolás', apellidos: 'Parra Godoy', email: 'nicolas.parra@alumnos.nuevaformacion.cl' },
  { id: 'est-012', rut: rut(21789012), nombres: 'Catalina', apellidos: 'Ibarra Reyes', email: 'catalina.ibarra@alumnos.nuevaformacion.cl' },
];

export function nombreCompleto(e: Pick<Estudiante, 'nombres' | 'apellidos'>): string {
  return `${e.nombres} ${e.apellidos}`;
}
