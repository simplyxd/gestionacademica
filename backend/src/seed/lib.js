// Utilidades que reciben los archivos de semilla (db/seed/NN-*.js). Trabajan con modelos de Mongoose (decisión 2A),
// así que se aplican las validaciones, los valores por defecto y las fechas automáticas del esquema.
//
// Los registros se identifican por CLAVE NATURAL (código, RUT, correo), nunca por un ObjectId escrito a mano:
// los ObjectId cambian en cada base, las claves naturales no.

const AYUDA_CLAVE =
  'La clave natural debe ser un objeto con al menos un campo y todos con valor, por ejemplo { codigo: "SCL" }. ' +
  'Una clave vacía podría actualizar o devolver un registro cualquiera.';

function validarClave(clave) {
  const esValida =
    clave !== null &&
    typeof clave === 'object' &&
    !Array.isArray(clave) &&
    Object.keys(clave).length > 0 &&
    Object.values(clave).every((valor) => valor !== undefined && valor !== null && valor !== '');

  if (!esValida) throw new TypeError(AYUDA_CLAVE);
}

/**
 * Crea el contexto que recibe cada archivo de semilla.
 * @param {{ log?: (mensaje: string) => void }} [opciones]
 */
export function crearContexto({ log = () => {} } = {}) {
  const estadisticas = { creados: 0, actualizados: 0 };

  /**
   * "Actualiza si ya existe, inserta si no", buscando por clave natural. Correrlo dos veces no duplica nada.
   * @returns el documento resultante.
   */
  async function upsertPorClave(Modelo, clave, datos) {
    validarClave(clave);

    const resultado = await Modelo.findOneAndUpdate(
      clave,
      { $set: datos },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true, includeResultMetadata: true },
    );

    if (resultado.lastErrorObject?.updatedExisting) estadisticas.actualizados += 1;
    else estadisticas.creados += 1;

    return resultado.value;
  }

  /**
   * Devuelve el _id del registro con esa clave natural, para usarlo como referencia desde otra colección.
   * Falla si no existe (probablemente el archivo que lo crea corre después) o si hay más de uno.
   */
  async function resolver(Modelo, clave) {
    validarClave(clave);

    const encontrados = await Modelo.find(clave).select('_id').limit(2).lean();
    const descripcion = `${Modelo.modelName} ${JSON.stringify(clave)}`;

    if (encontrados.length === 0) {
      throw new Error(`resolver: no existe ${descripcion}. ¿El archivo que lo crea tiene un número menor, para que corra antes?`);
    }
    if (encontrados.length > 1) {
      throw new Error(`resolver: la clave de ${descripcion} es ambigua (hay más de un registro).`);
    }
    return encontrados[0]._id;
  }

  return { upsertPorClave, resolver, log, estadisticas };
}
