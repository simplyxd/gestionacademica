const { createRequire } = require('node:module');

// db/ no tiene node_modules: mongoose se resuelve desde backend/.
const mongoose = createRequire(require.resolve('../../../backend/package.json'))('mongoose');
const {
  perfilDocenteSchema,
  perfilEstudianteSchema,
  validarPerfilSegunRol,
} = require('../../../backend/src/models/perfiles.schemas');
const { crearAzar } = require('./azar');
const { generarDocentes, generarEstudiantes } = require('./personas');
const { ALUMNOS_DEMO } = require('./demo');

const PerfilDocente = mongoose.model('PerfilDocenteSeed', perfilDocenteSchema);
const PerfilEstudiante = mongoose.model('PerfilEstudianteSeed', perfilEstudianteSchema);

describe('las personas del seed cumplen los esquemas de perfil del backend', () => {
  it('20 docentes con perfil docente válido y coherente con su rol', async () => {
    for (const docente of generarDocentes(20, crearAzar(1))) {
      expect(validarPerfilSegunRol(docente)).toBeNull();
      await expect(new PerfilDocente(docente.perfilDocente).validate()).resolves.toBeUndefined();
    }
  });

  it('200 estudiantes y los alumnos de demo con perfil de estudiante válido', async () => {
    for (const estudiante of [...generarEstudiantes(200, crearAzar(1)), ...ALUMNOS_DEMO]) {
      expect(validarPerfilSegunRol(estudiante)).toBeNull();
      await expect(new PerfilEstudiante(estudiante.perfilEstudiante).validate()).resolves.toBeUndefined();
    }
  });
});
