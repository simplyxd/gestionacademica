/** Mock de personas académicas (CU4). Baja lógica: inactivo = no pertenece activamente; el registro no se elimina. */

export const PERSONAS_MOCK_INICIAL = {
  docentes: [
    {
      id: 'd-1',
      nombre: 'Ana Pérez',
      documento: '28456123',
      gmail: 'ana.perez@gmail.com',
      telefono: '099 123 456',
      incorporacion: '2023-03-01',
      materia: 'Programación web',
      cursosEncargados: '2A, 3B',
      tipoVinculo: 'Tiempo completo',
      estado: 'activo',
    },
    {
      id: 'd-2',
      nombre: 'Carlos Méndez',
      documento: '32111222',
      gmail: 'c.mendez@gmail.com',
      telefono: '098 333 777',
      incorporacion: '2021-08-15',
      materia: 'Base de datos',
      cursosEncargados: '2C',
      tipoVinculo: 'Por horas',
      estado: 'inactivo',
    },
  ],
  estudiantes: [
    {
      id: 'e-1',
      nombre: 'Lucía Gómez',
      documento: '55333222',
      gmail: 'lucia.gomez@gmail.com',
      telefono: '097 800 100',
      incorporacion: '2025-02-10',
      codigoEstudiante: 'EST-2025-001',
      contactoEmergencia: 'Marta Gómez - 099 550 001',
      nivelCursando: 'Nivel 1',
      estado: 'activo',
    },
    {
      id: 'e-2',
      nombre: 'Mateo Ruiz',
      documento: '60123456',
      gmail: 'mateo.ruiz@gmail.com',
      telefono: '096 110 220',
      incorporacion: '2024-07-20',
      codigoEstudiante: 'EST-2024-044',
      contactoEmergencia: 'Juan Ruiz - 098 880 990',
      nivelCursando: 'Nivel 2',
      estado: 'inactivo',
    },
  ],
};

export function esPersonaActiva(persona) {
  return persona.estado === 'activo';
}

/** Para matrícula / inscripción: solo miembros activos de la institución. */
export function listarDocentesActivos(personas) {
  return personas.docentes.filter(esPersonaActiva);
}

export function listarEstudiantesActivos(personas) {
  return personas.estudiantes.filter(esPersonaActiva);
}

export function alternarEstadoMiembro(personas, rol, id) {
  const lista = personas[rol].map((persona) => {
    if (persona.id !== id) {
      return persona;
    }
    const nuevoEstado = persona.estado === 'activo' ? 'inactivo' : 'activo';
    return { ...persona, estado: nuevoEstado };
  });

  return { ...personas, [rol]: lista };
}
