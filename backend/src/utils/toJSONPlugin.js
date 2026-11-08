// Plugin de Mongoose para lo que viaja al cliente (contrato transversal):
//  - "_id" sale como "id" (texto);
//  - "__v" no sale;
//  - los campos con select:false no salen, tampoco dentro de objetos anidados.
// Las fechas ya salen en ISO 8601 porque JSON.stringify las convierte.

/** Borra una ruta con puntos ("detalle.secreto") de un objeto, si existe. */
function borrarRuta(objeto, ruta) {
  const partes = ruta.split('.');
  const ultima = partes.pop();
  let actual = objeto;
  for (const parte of partes) {
    actual = actual?.[parte];
    if (actual === null || typeof actual !== 'object') return;
  }
  delete actual[ultima];
}

export function toJSONPlugin(schema) {
  const opcionesPrevias = schema.get('toJSON') ?? {};
  const transformPrevio = opcionesPrevias.transform;

  schema.set('toJSON', {
    ...opcionesPrevias,
    transform(doc, ret, opciones) {
      // Si el esquema ya tenía su propio transform, se respeta y después se limpia.
      const resultado = typeof transformPrevio === 'function' ? (transformPrevio(doc, ret, opciones) ?? ret) : ret;

      if (resultado._id !== undefined) {
        resultado.id = resultado._id.toString();
        delete resultado._id;
      }
      delete resultado.__v;

      schema.eachPath((ruta, tipo) => {
        if (tipo.options?.select === false) borrarRuta(resultado, ruta);
      });

      return resultado;
    },
  });
}
