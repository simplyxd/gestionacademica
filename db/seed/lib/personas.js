const { formatRut } = require('./rut');

const NOMBRES = [
  'Sofía', 'Mateo', 'Valentina', 'Benjamín', 'Isidora', 'Vicente', 'Martina', 'Agustín', 'Florencia', 'Tomás',
  'Josefa', 'Joaquín', 'Antonia', 'Maximiliano', 'Catalina', 'Lucas', 'Fernanda', 'Diego', 'Javiera', 'Cristóbal',
  'Camila', 'Felipe', 'Constanza', 'Ignacio', 'Daniela', 'Sebastián', 'Paula', 'Matías', 'Francisca', 'Gabriel',
];

const APELLIDOS = [
  'González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva', 'Martínez', 'Sepúlveda',
  'Morales', 'Rodríguez', 'López', 'Fuentes', 'Hernández', 'Torres', 'Araya', 'Flores', 'Espinoza', 'Valenzuela',
  'Castillo', 'Tapia', 'Reyes', 'Gutiérrez', 'Castro', 'Pizarro', 'Álvarez', 'Vásquez', 'Sánchez', 'Fernández',
];

const ESPECIALIDADES = ['Informática', 'Matemáticas', 'Administración', 'Contabilidad', 'Enfermería', 'Inglés'];
const TIPOS_VINCULO = ['planta', 'contrata', 'honorarios'];

const DOMINIO_DOCENTES = 'nuevaformacion.cl';
const DOMINIO_ALUMNOS = 'alumnos.nuevaformacion.cl';

// Rangos de RUT disjuntos: docentes, estudiantes generados y alumnos de demo nunca coinciden.
const RUT_BASE_DOCENTES = 9_000_000;
const RUT_PASO_DOCENTES = 37_501;
const RUT_BASE_ESTUDIANTES = 18_000_000;
const RUT_PASO_ESTUDIANTES = 13_337;

const AÑO_ACTUAL = 2026;
const NIVEL_MAXIMO = 8;

function slug(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

function crearCorreos(dominio) {
  const usados = new Map();
  return (nombres, apellidos) => {
    const base = `${slug(nombres)}.${slug(apellidos.split(' ')[0])}`;
    const veces = (usados.get(base) ?? 0) + 1;
    usados.set(base, veces);
    return `${veces === 1 ? base : `${base}${veces}`}@${dominio}`;
  };
}

function telefono(azar) {
  const bloque = () => String(azar.entero(0, 9999)).padStart(4, '0');
  return `+56 9 ${bloque()} ${bloque()}`;
}

function nombreCompleto(azar) {
  return {
    nombres: azar.elegir(NOMBRES),
    apellidos: `${azar.elegir(APELLIDOS)} ${azar.elegir(APELLIDOS)}`,
  };
}

function generarDocentes(cantidad, azar) {
  const correo = crearCorreos(DOMINIO_DOCENTES);
  return Array.from({ length: cantidad }, (_, i) => {
    const { nombres, apellidos } = nombreCompleto(azar);
    const especialidad = azar.elegir(ESPECIALIDADES);
    return {
      rut: formatRut(RUT_BASE_DOCENTES + i * RUT_PASO_DOCENTES),
      nombres,
      apellidos,
      email: correo(nombres, apellidos),
      telefono: telefono(azar),
      rol: 'docente',
      estado: 'activo',
      perfilDocente: {
        especialidad,
        tipoVinculo: azar.elegir(TIPOS_VINCULO),
        departamentos: [especialidad],
      },
    };
  });
}

/** El año de ingreso se deriva del nivel (dos niveles por año) y el código es correlativo dentro del año. */
function generarEstudiantes(cantidad, azar) {
  const correo = crearCorreos(DOMINIO_ALUMNOS);
  const correlativoPorAño = new Map();

  return Array.from({ length: cantidad }, (_, i) => {
    const { nombres, apellidos } = nombreCompleto(azar);
    const nivelCursando = azar.entero(1, NIVEL_MAXIMO);
    const año = AÑO_ACTUAL - Math.floor((nivelCursando - 1) / 2);
    const correlativo = (correlativoPorAño.get(año) ?? 0) + 1;
    correlativoPorAño.set(año, correlativo);
    const contacto = nombreCompleto(azar);

    return {
      rut: formatRut(RUT_BASE_ESTUDIANTES + i * RUT_PASO_ESTUDIANTES),
      nombres,
      apellidos,
      email: correo(nombres, apellidos),
      telefono: telefono(azar),
      rol: 'estudiante',
      estado: 'activo',
      perfilEstudiante: {
        codigoEstudiante: `EST-${año}-${String(correlativo).padStart(3, '0')}`,
        contactoEmergencia: `${contacto.nombres} ${contacto.apellidos.split(' ')[0]} · ${telefono(azar)}`,
        nivelCursando,
        aprobadas: [],
      },
    };
  });
}

module.exports = { generarDocentes, generarEstudiantes };
