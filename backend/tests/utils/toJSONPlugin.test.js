import mongoose from 'mongoose';
import { describe, it, expect } from 'vitest';
import { toJSONPlugin } from '../../src/utils/toJSONPlugin.js';

// Contrato: los IDs viajan como "id" (string); "_id" y "__v" no salen al cliente;
// los campos con select:false tampoco; las fechas salen en ISO 8601.

// Un plugin aplicado con schema.plugin() NO se propaga solo a los subdocumentos: aquí se aplica a ambos.
// (El plugin global de la app sí llega a los esquemas hijos; eso lo prueba tests/config/mongoose.test.js.)
const esquemaDeItem = new mongoose.Schema({ texto: String });
esquemaDeItem.plugin(toJSONPlugin);

const esquema = new mongoose.Schema(
  {
    nombre: String,
    clave: { type: String, select: false },
    detalle: { secreto: { type: String, select: false }, visible: String },
    items: [esquemaDeItem],
  },
  { timestamps: true },
);
esquema.plugin(toJSONPlugin);
const Modelo = mongoose.model('ModeloDePruebaDeToJSON', esquema);

/** Crea un documento "como si viniera de la base" y devuelve lo que viajaría por la red. */
function aJson(datos) {
  const doc = Modelo.hydrate({ _id: new mongoose.Types.ObjectId(), __v: 3, ...datos });
  return { doc, json: JSON.parse(JSON.stringify(doc)) };
}

describe('toJSONPlugin', () => {
  it('expone _id como "id" en texto y no deja _id', () => {
    const { doc, json } = aJson({ nombre: 'Sede Norte' });

    expect(json.id).toBe(doc._id.toString());
    expect(json).not.toHaveProperty('_id');
  });

  it('oculta __v', () => {
    const { json } = aJson({ nombre: 'Sede Norte' });

    expect(json).not.toHaveProperty('__v');
  });

  it('oculta los campos con select:false, también dentro de objetos anidados', () => {
    const { json } = aJson({ nombre: 'Ana', clave: 'hash-secreto', detalle: { secreto: 'dato-secreto', visible: 'ok' } });

    expect(json).not.toHaveProperty('clave');
    expect(json.detalle).toEqual({ visible: 'ok' });
    expect(JSON.stringify(json)).not.toContain('secreto');
  });

  it('cambia también el _id de los subdocumentos por id', () => {
    const { json } = aJson({ nombre: 'Ana', items: [{ texto: 'uno' }, { texto: 'dos' }] });

    expect(json.items).toHaveLength(2);
    for (const item of json.items) {
      expect(typeof item.id).toBe('string');
      expect(item).not.toHaveProperty('_id');
    }
  });

  it('entrega las fechas en ISO 8601', () => {
    const { json } = aJson({ nombre: 'Ana', createdAt: new Date('2026-01-02T03:04:05.000Z') });

    expect(json.createdAt).toBe('2026-01-02T03:04:05.000Z');
  });

  it('respeta un transform propio del esquema: lo aplica y además limpia', () => {
    const conTransform = new mongoose.Schema(
      { nombre: String },
      {
        toJSON: {
          transform: (doc, ret) => {
            ret.extra = 'agregado';
            return ret;
          },
        },
      },
    );
    conTransform.plugin(toJSONPlugin);
    const OtroModelo = mongoose.model('ModeloConTransformPropio', conTransform);

    const json = JSON.parse(JSON.stringify(OtroModelo.hydrate({ _id: new mongoose.Types.ObjectId(), nombre: 'A', __v: 1 })));

    expect(json.extra).toBe('agregado');
    expect(json).toHaveProperty('id');
    expect(json).not.toHaveProperty('_id');
    expect(json).not.toHaveProperty('__v');
  });
});
