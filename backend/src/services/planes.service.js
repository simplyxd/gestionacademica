// Reglas de negocio de planes de estudio y prerrequisitos (LOR-4 y LOR-5).
import { ESTADOS_PLAN } from '../constants/enums.js';
import { AppError } from '../errors/AppError.js';
import { PLN } from '../errors/codigos/planes.js';
import { Asignatura } from '../models/asignatura.model.js';
import { Carrera } from '../models/carrera.model.js';
import { Plan } from '../models/plan.model.js';
import { validarGrafoPlan } from '../utils/grafoPrerrequisitos.js';
import { envolver } from '../utils/respuesta.js';
import { paginar } from '../utils/paginar.js';
import { alcanceCarreras, buscarEnAlcance as buscarCarrera } from './carreras.service.js';
import { aObjectId, conUnicidad, esCoordinador, filtroBusqueda } from './estructura.comun.js';

const noEncontrado = () => new AppError(404, PLN.NO_ENCONTRADO, 'El plan de estudios no existe o no es de tus sedes.');

const unicidad = (nombre) => ({
  un_vigente_por_carrera: () =>
    new AppError(409, PLN.VIGENTE_DUPLICADO, 'La carrera ya tiene un plan vigente. Márcalo como histórico primero.', {
      regla: 'Un solo plan vigente por carrera',
    }),
  nombre_unico_en_carrera: () =>
    new AppError(409, PLN.NOMBRE_DUPLICADO, `Esta carrera ya tiene un plan llamado «${nombre}».`, { details: { campo: 'nombre' } }),
});

/** Plan + su carrera, respetando el alcance del coordinador (404 si no es suyo: no se filtra existencia). */
async function buscarEnAlcance(usuario, id) {
  const plan = await Plan.findById(aObjectId(id));
  if (!plan) throw noEncontrado();
  const carrera = await Carrera.findOne({ _id: plan.carreraId, ...alcanceCarreras(usuario) });
  if (!carrera) throw noEncontrado();
  return { plan, carrera };
}

const exigirEditable = (plan) => {
  if (plan.estado === ESTADOS_PLAN.HISTORICO) {
    throw new AppError(409, PLN.HISTORICO_NO_EDITABLE, `El plan «${plan.nombre}» es histórico y no se edita; sus matriculados siguen válidos.`, {
      regla: 'Plan histórico inmutable',
    });
  }
};

export async function listar(usuario, query = {}) {
  const filtro = { ...filtroBusqueda(query.q, ['nombre']) };
  if (query.estado) filtro.estado = query.estado;
  if (esCoordinador(usuario)) {
    const ids = (await Carrera.find(alcanceCarreras(usuario)).select('_id').lean()).map((c) => c._id);
    filtro.carreraId = { $in: ids };
  }
  if (query.carreraId) {
    const pedida = aObjectId(query.carreraId, 'carreraId');
    filtro.carreraId = filtro.carreraId ? { $in: filtro.carreraId.$in.filter((c) => c.equals(pedida)) } : pedida;
  }
  return paginar(Plan, filtro, query, { camposOrdenables: ['nombre', 'estado'], ordenPorDefecto: 'nombre' });
}

export async function obtener(usuario, id) {
  return envolver((await buscarEnAlcance(usuario, id)).plan);
}

export async function crear(usuario, { carreraId, nombre, estado = ESTADOS_PLAN.VIGENTE }) {
  const carrera = await buscarCarrera(usuario, carreraId);
  const plan = await conUnicidad(() => Plan.create({ carreraId: carrera._id, nombre, estado, asignaturas: [] }), unicidad(nombre));
  return envolver(plan);
}

export async function actualizar(usuario, id, { nombre }) {
  const { plan } = await buscarEnAlcance(usuario, id);
  exigirEditable(plan);
  if (nombre !== undefined) plan.nombre = nombre;
  await conUnicidad(() => plan.save(), unicidad(plan.nombre));
  return envolver(plan);
}

/** vigente ↔ historico. Activar un plan con otro vigente choca con el índice parcial (409). */
export async function cambiarEstado(usuario, id, estado) {
  const { plan } = await buscarEnAlcance(usuario, id);
  plan.estado = estado;
  await conUnicidad(() => plan.save(), unicidad(plan.nombre));
  return envolver(plan);
}

/** Traduce la violación del grafo a un 422 que nombra las asignaturas por su código. */
function errorDeGrafo(violacion, codigoDe, semestreMaximo) {
  const c = (id) => codigoDe.get(String(id)) ?? String(id);
  switch (violacion.tipo) {
    case 'REPETIDA':
      return new AppError(422, PLN.ASIGNATURA_REPETIDA, `${c(violacion.asignaturaId)} aparece más de una vez en el plan.`, {
        regla: 'Asignatura única en el plan',
        details: violacion,
      });
    case 'FUERA_DEL_PLAN':
      return new AppError(
        422,
        PLN.PRERREQUISITO_FUERA_DEL_PLAN,
        `${c(violacion.asignaturaId)} exige ${c(violacion.prerrequisitoId)}, que no está en este plan.`,
        { regla: 'Prerrequisito dentro del mismo plan', details: violacion },
      );
    case 'CICLO': {
      const camino = violacion.ciclo.map(c).join(' → ');
      return new AppError(422, PLN.CICLO_PREREQUISITOS, `Los prerrequisitos forman un ciclo: ${camino}. Ninguna de esas asignaturas podría inscribirse.`, {
        regla: 'Prerrequisitos sin ciclos',
        details: { ciclo: violacion.ciclo.map(String), cicloCodigos: violacion.ciclo.map(c), camino },
      });
    }
    case 'SEMESTRE':
      return new AppError(
        422,
        PLN.PRERREQUISITO_SEMESTRE,
        `${c(violacion.asignaturaId)} (semestre ${violacion.semestre}) exige ${c(violacion.prerrequisitoId)}, que está en el semestre ${violacion.semestrePrerrequisito}; el prerrequisito debe estar en un semestre anterior.`,
        { regla: 'Prerrequisito en semestre anterior', details: { ...violacion, semestreMaximo } },
      );
    default:
      return new Error(`Violación de grafo desconocida: ${violacion.tipo}`);
  }
}

/**
 * PUT /api/planes/:id/asignaturas: reemplaza el conjunto completo. Se valida el grafo RESULTANTE entero
 * antes de guardar, y se guarda con control optimista (updatedAt) para que dos ediciones simultáneas
 * no mezclen conjuntos que por separado eran válidos.
 */
export async function reemplazarAsignaturas(usuario, id, asignaturas) {
  const { plan, carrera } = await buscarEnAlcance(usuario, id);
  exigirEditable(plan);

  const normalizadas = asignaturas.map((a, i) => ({
    asignaturaId: aObjectId(a.asignaturaId, `asignaturas[${i}].asignaturaId`),
    semestre: a.semestre,
    tipo: a.tipo,
    prerrequisitos: (a.prerrequisitos ?? []).map((p, j) => aObjectId(p, `asignaturas[${i}].prerrequisitos[${j}]`)),
  }));

  const ids = [...new Set(normalizadas.flatMap((a) => [a.asignaturaId, ...a.prerrequisitos]).map(String))];
  const catalogo = await Asignatura.find({ _id: { $in: ids } }).select('codigo').lean();
  const codigoDe = new Map(catalogo.map((a) => [a._id.toString(), a.codigo]));

  const inexistentes = normalizadas.map((a) => String(a.asignaturaId)).filter((x) => !codigoDe.has(x));
  if (inexistentes.length > 0) {
    throw new AppError(422, PLN.ASIGNATURA_INEXISTENTE, `Hay ${inexistentes.length} asignatura(s) que no existen en el catálogo.`, {
      regla: 'Asignaturas del catálogo',
      details: { asignaturas: inexistentes },
    });
  }

  const fuera = normalizadas.find((a) => a.semestre > carrera.duracionSemestres);
  if (fuera) {
    throw new AppError(
      422,
      PLN.SEMESTRE_FUERA_DE_CARRERA,
      `${codigoDe.get(String(fuera.asignaturaId))} está en el semestre ${fuera.semestre}, pero ${carrera.codigo} dura ${carrera.duracionSemestres} semestres.`,
      { regla: 'Semestre dentro de la duración de la carrera', details: { asignaturaId: String(fuera.asignaturaId), semestre: fuera.semestre } },
    );
  }

  const violacion = validarGrafoPlan(normalizadas);
  if (violacion) throw errorDeGrafo(violacion, codigoDe, carrera.duracionSemestres);

  const actualizado = await Plan.findOneAndUpdate(
    { _id: plan._id, updatedAt: plan.updatedAt, estado: ESTADOS_PLAN.VIGENTE },
    { $set: { asignaturas: normalizadas } },
    { returnDocument: 'after', runValidators: true },
  );
  if (!actualizado) {
    throw new AppError(409, PLN.EDICION_CONCURRENTE, `Otra persona modificó el plan «${plan.nombre}» mientras lo editabas. Recarga y vuelve a intentarlo.`);
  }
  return envolver(actualizado);
}

/** GET /api/planes/:id/grafo: nodos (con código, nombre y semestre) y aristas «desde exige hacia». */
export async function grafo(usuario, id) {
  const { plan } = await buscarEnAlcance(usuario, id);
  const catalogo = await Asignatura.find({ _id: { $in: plan.asignaturas.map((a) => a.asignaturaId) } }).lean();
  const porId = new Map(catalogo.map((a) => [a._id.toString(), a]));

  const nodos = plan.asignaturas.map((a) => {
    const asg = porId.get(a.asignaturaId.toString());
    return { id: a.asignaturaId.toString(), codigo: asg?.codigo, nombre: asg?.nombre, creditos: asg?.creditos, semestre: a.semestre, tipo: a.tipo };
  });
  const aristas = plan.asignaturas.flatMap((a) => a.prerrequisitos.map((p) => ({ desde: a.asignaturaId.toString(), hacia: p.toString() })));
  return envolver({ planId: plan._id.toString(), nodos, aristas });
}
