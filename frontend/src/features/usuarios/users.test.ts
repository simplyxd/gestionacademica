import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api';
import {
  borradorVacio,
  cuerpoDeUsuario,
  erroresDeApi,
  leerClaveTemporal,
  normalizarListado,
  normalizarSedes,
  textoDeSedes,
  rangoPagina,
  textoPerfil,
  validarBorrador,
  type BorradorUsuario,
  type UsuarioLista,
} from './users';

function borrador(parcial: Partial<BorradorUsuario> = {}): BorradorUsuario {
  return {
    ...borradorVacio(),
    nombre: 'Camila Soto',
    rut: '12.345.678-5',
    correo: 'camila.soto@instituto.example',
    telefono: '+56 9 5555 0101',
    rol: 'admin',
    sedes: ['sede-1'],
    incorporacion: '2026-03-01',
    password: 'Clave-Inicial-1',
    confirmacion: 'Clave-Inicial-1',
    ...parcial,
  };
}

describe('validarBorrador', () => {
  it('acepta admin y coordinador sin perfil académico', () => {
    expect(validarBorrador(borrador(), 'crear')).toEqual({});
    expect(validarBorrador(borrador({ rol: 'coordinador' }), 'crear')).toEqual({});
  });

  it('el docente pide vínculo y el estudiante pide código, contacto y nivel', () => {
    expect(validarBorrador(borrador({ rol: 'docente' }), 'crear').tipoVinculo).toMatch(/vínculo/);
    expect(validarBorrador(borrador({ rol: 'docente', tipoVinculo: 'planta', departamentos: ['Computación'] }), 'crear')).toEqual({});
    const estudiante = borrador({ rol: 'estudiante', codigoEstudiante: 'est-2026-014', contactoEmergencia: 'Ana Soto', nivelCursando: '3' });
    expect(validarBorrador(estudiante, 'crear')).toEqual({});
    expect(validarBorrador(borrador({ rol: 'estudiante', codigoEstudiante: 'X-1', contactoEmergencia: 'Ana', nivelCursando: '3' }), 'crear').codigoEstudiante).toMatch(/EST-AAAA-NNN/);
    expect(validarBorrador(borrador({ rol: 'estudiante', codigoEstudiante: 'EST-2026-014', contactoEmergencia: 'Ana', nivelCursando: '9' }), 'crear').nivelCursando).toMatch(/1 al 8/);
  });

  it('al editar no pide contraseña', () => {
    expect(validarBorrador(borrador({ password: '', confirmacion: '' }), 'editar')).toEqual({});
  });
});

describe('cuerpoDeUsuario', () => {
  it('admin y coordinador viajan sin perfil; el alta obliga a cambiar la clave', () => {
    const cuerpo = cuerpoDeUsuario(borrador({ rol: 'coordinador', codigoEstudiante: 'EST-2026-001', tipoVinculo: 'planta' }), 'crear');
    expect(cuerpo.perfilDocente).toBeNull();
    expect(cuerpo.perfilEstudiante).toBeNull();
    expect(cuerpo.clave).toBe('Clave-Inicial-1');
    expect(cuerpo).not.toHaveProperty('password');
  });

  it('arma el perfil según el rol y no manda la clave al editar', () => {
    const docente = cuerpoDeUsuario(
      borrador({ rol: 'docente', tipoVinculo: 'honorarios', especialidad: ' Física ', departamentos: ['Computación', ' computación '] }),
      'editar',
    );
    expect(docente.perfilDocente).toEqual({ especialidad: 'Física', tipoVinculo: 'honorarios', departamentos: ['Computación'] });
    expect(docente.perfilEstudiante).toBeNull();
    expect(docente.clave).toBeUndefined();

    const estudiante = cuerpoDeUsuario(
      borrador({ rol: 'estudiante', codigoEstudiante: 'est-2026-014', contactoEmergencia: 'Ana', nivelCursando: '2' }),
      'editar',
    );
    expect(estudiante.perfilEstudiante).toEqual({ codigoEstudiante: 'EST-2026-014', contactoEmergencia: 'Ana', nivelCursando: 2 });
    expect(estudiante.perfilDocente).toBeNull();
  });
});

describe('listado', () => {
  const fila: UsuarioLista = {
    id: 'u1',
    nombre: 'Diego Muñoz',
    rut: '13333333-9',
    correo: 'diego@instituto.example',
    telefono: '',
    rol: 'estudiante',
    sedes: [{ id: 's1', nombre: 'Sede Norte' }],
    estado: 'activo',
    incorporacion: '2026-03-01',
    perfilDocente: null,
    perfilEstudiante: { codigoEstudiante: 'EST-2026-004', contactoEmergencia: 'Ana', nivelCursando: 1 },
  };

  it('normaliza sedes populadas o en id, y descarta filas sin rol', () => {
    const lista = normalizarListado([
      {
        _id: 'u1',
        nombre: 'Diego Muñoz',
        rol: 'estudiante',
        estado: 'activo',
        rut: '13333333-9',
        correo: 'diego@instituto.example',
        sedes: ['s1', { id: 's2', nombre: 'Sede Sur' }],
        incorporacion: '2026-03-01T00:00:00.000Z',
        perfilEstudiante: { codigoEstudiante: 'est-2026-004', contactoEmergencia: 'Ana', nivelCursando: 1 },
      },
      { id: 'mala', nombre: 'Sin rol', estado: 'activo' },
    ]);

    expect(lista).toHaveLength(1);
    expect(lista[0]?.sedes).toEqual([
      { id: 's1', nombre: 's1' },
      { id: 's2', nombre: 'Sede Sur' },
    ]);
    expect(lista[0]?.incorporacion).toBe('2026-03-01');
    expect(lista[0]?.perfilEstudiante?.codigoEstudiante).toBe('EST-2026-004');
    expect(normalizarSedes([{ id: 's1', nombre: 'Central' }])).toEqual([{ id: 's1', nombre: 'Central' }]);
  });

  it('muestra el nombre de la sede cuando el usuario solo trae el id', () => {
    const catalogo = [{ id: '6af1dfd1c187c8dbc0d7e7a5', nombre: 'Sede Central' }];
    const delUsuario = [{ id: '6af1dfd1c187c8dbc0d7e7a5', nombre: '6af1dfd1c187c8dbc0d7e7a5' }];
    expect(textoDeSedes(delUsuario, catalogo)).toBe('Sede Central');
  });

  it('el texto del perfil no inventa datos para admin', () => {
    expect(textoPerfil(fila)).toBe('EST-2026-004 · Nivel 1 · Ana');
    expect(textoPerfil({ ...fila, rol: 'admin', perfilEstudiante: null })).toBe('—');
  });

  it('calcula el rango que muestra la barra', () => {
    expect(rangoPagina(2, 20, 45)).toEqual({ desde: 21, hasta: 40 });
    expect(rangoPagina(1, 20, 0)).toEqual({ desde: 0, hasta: 0 });
  });
});

describe('clave temporal y errores del API', () => {
  it('lee la clave una vez, en el campo que venga', () => {
    expect(leerClaveTemporal({ claveTemporal: 'Tmp-1234' })).toBe('Tmp-1234');
    expect(leerClaveTemporal({ usuario: { id: 'u1' } })).toBeNull();
  });

  it('traduce details.campos al campo del formulario', () => {
    const error = new ApiError({
      status: 400,
      code: 'GEN_DATOS_INVALIDOS',
      message: 'Hay datos inválidos en: perfilEstudiante.codigoEstudiante.',
      details: { campos: [{ campo: 'perfilEstudiante.codigoEstudiante', motivo: 'es obligatorio' }] },
    });
    expect(erroresDeApi(error).codigoEstudiante).toBe('Es obligatorio.');
    const clave = new ApiError({
      status: 400,
      code: 'GEN_DATOS_INVALIDOS',
      message: 'Hay datos inválidos en: clave.',
      details: { campos: [{ campo: 'clave', motivo: 'es obligatoria' }] },
    });
    expect(erroresDeApi(clave).password).toBe('Es obligatoria.');
  });
});
