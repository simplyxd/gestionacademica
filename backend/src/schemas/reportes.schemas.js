import { ESTADOS_MATRICULA } from '../constants/enums.js';
import { enumQuery, idQuery, paginacion } from './estructura.comun.schemas.js';

export const esquemaMatriculas = [...paginacion(), idQuery('periodoId'), idQuery('carreraId'), enumQuery('estado', Object.values(ESTADOS_MATRICULA))];
export const esquemaEstudiantes = [...paginacion(), idQuery('periodoId'), idQuery('carreraId'), idQuery('asignaturaId')];
export const esquemaPorPeriodo = [...paginacion(), idQuery('periodoId')];
