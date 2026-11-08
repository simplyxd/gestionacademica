import mongoose from 'mongoose';
import { describe, it, expect } from 'vitest';
import '../../src/app.js'; // importar la app registra el plugin global ANTES de que se compile cualquier modelo

// Decisión (3A): el plugin toJSON es global; ningún dueño de dominio tiene que acordarse de agregarlo.

describe('plugin global de Mongoose', () => {
  it('todo modelo nuevo expone "id" y oculta _id y __v sin pedirlo en su esquema', () => {
    const Modelo = mongoose.model('ModeloConPluginGlobal', new mongoose.Schema({ nombre: String }));
    const doc = Modelo.hydrate({ _id: new mongoose.Types.ObjectId(), nombre: 'A', __v: 0 });

    expect(JSON.parse(JSON.stringify(doc))).toEqual({ id: doc._id.toString(), nombre: 'A' });
  });

  it('también llega a los subdocumentos, sin que el esquema hijo lo pida', () => {
    const Modelo = mongoose.model(
      'ModeloConSubdocumentos',
      new mongoose.Schema({ nombre: String, items: [new mongoose.Schema({ texto: String })] }),
    );
    const doc = Modelo.hydrate({ _id: new mongoose.Types.ObjectId(), nombre: 'A', items: [{ texto: 'uno' }], __v: 0 });

    const json = JSON.parse(JSON.stringify(doc));

    expect(typeof json.items[0].id).toBe('string');
    expect(json.items[0]).not.toHaveProperty('_id');
  });
});
