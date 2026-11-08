import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import mongoose from 'mongoose';
import Seccion from '../../src/models/seccion.model.js';
import { conectarBaseDePrueba, limpiarBase, desconectarBaseDePrueba } from '../helpers/db.js';

describe('Modelo Seccion - Pruebas de Creación, Defaults y Restricciones', () => {
  beforeAll(async () => {
    await conectarBaseDePrueba();
    await Seccion.init();
  });

  afterEach(async () => {
    await limpiarBase();
  });

  afterAll(async () => {
    await desconectarBaseDePrueba();
  });

  it('debería crear una sección válida exitosamente y asignar los valores por defecto (inscritos: 0 y estado: abierta)', async () => {
    const datosSeccion = {
      asignaturaId: new mongoose.Types.ObjectId(),
      periodoId: new mongoose.Types.ObjectId(),
      docenteId: new mongoose.Types.ObjectId(),
      sedeId: new mongoose.Types.ObjectId(),
      jornada: 'diurna',
      modalidad: 'presencial',
      letra: 'A',
      cupoMaximo: 40,
      bloques: [
        { dia: 0, inicioMin: 480, finMin: 530 }
      ]
    };

    const seccionCreada = await Seccion.create(datosSeccion);

    expect(seccionCreada).toBeDefined();
    expect(seccionCreada._id).toBeDefined();
    expect(seccionCreada.inscritos).toBe(0);
    expect(seccionCreada.estado).toBe('abierta');
  });

  it('debería permitir guardar una sección válida omitiendo el campo opcional sala', async () => {
    const datosSeccionSinSala = {
      asignaturaId: new mongoose.Types.ObjectId(),
      periodoId: new mongoose.Types.ObjectId(),
      docenteId: new mongoose.Types.ObjectId(),
      sedeId: new mongoose.Types.ObjectId(),
      jornada: 'diurna',
      modalidad: 'presencial',
      letra: 'B',
      cupoMaximo: 30,
      bloques: [
        { dia: 1, inicioMin: 540, finMin: 590 }
      ]
    };

    const seccionCreada = await Seccion.create(datosSeccionSinSala);

    expect(seccionCreada).toBeDefined();
    expect(seccionCreada._id).toBeDefined();
    expect(seccionCreada.sala).toBeUndefined();
  });

  it('debería rechazar una sección cuando el número de inscritos supera el cupo máximo', async () => {
    const datosSeccionInvalida = {
      asignaturaId: new mongoose.Types.ObjectId(),
      periodoId: new mongoose.Types.ObjectId(),
      docenteId: new mongoose.Types.ObjectId(),
      sedeId: new mongoose.Types.ObjectId(),
      jornada: 'diurna',
      modalidad: 'presencial',
      letra: 'C',
      cupoMaximo: 20,
      inscritos: 25,
      bloques: [
        { dia: 0, inicioMin: 480, finMin: 530 }
      ]
    };

    await expect(Seccion.create(datosSeccionInvalida)).rejects.toThrow(
      'El número de inscritos no puede superar el cupo máximo'
    );
  });

  it('debería rechazar una sección con un bloque horario inválido donde inicioMin es igual a finMin', async () => {
    const datosSeccionBloqueInvalido = {
      asignaturaId: new mongoose.Types.ObjectId(),
      periodoId: new mongoose.Types.ObjectId(),
      docenteId: new mongoose.Types.ObjectId(),
      sedeId: new mongoose.Types.ObjectId(),
      jornada: 'diurna',
      modalidad: 'presencial',
      letra: 'D',
      cupoMaximo: 30,
      bloques: [
        { dia: 0, inicioMin: 500, finMin: 500 }
      ]
    };

    await expect(Seccion.create(datosSeccionBloqueInvalido)).rejects.toThrow(
      'El minuto de inicio debe ser estrictamente menor que el minuto de fin'
    );
  });

  it('debería rechazar la creación de una segunda sección con la misma asignaturaId, periodoId y letra verificando explícitamente el código de error 11000', async () => {
    const asignaturaIdComun = new mongoose.Types.ObjectId();
    const periodoIdComun = new mongoose.Types.ObjectId();

    const datosSeccionUno = {
      asignaturaId: asignaturaIdComun,
      periodoId: periodoIdComun,
      docenteId: new mongoose.Types.ObjectId(),
      sedeId: new mongoose.Types.ObjectId(),
      jornada: 'diurna',
      modalidad: 'presencial',
      letra: 'A',
      cupoMaximo: 30,
      bloques: [
        { dia: 0, inicioMin: 480, finMin: 530 }
      ]
    };

    const datosSeccionDos = {
      asignaturaId: asignaturaIdComun,
      periodoId: periodoIdComun,
      docenteId: new mongoose.Types.ObjectId(),
      sedeId: new mongoose.Types.ObjectId(),
      jornada: 'vespertina',
      modalidad: 'online',
      letra: 'A',
      cupoMaximo: 25,
      bloques: [
        { dia: 1, inicioMin: 540, finMin: 590 }
      ]
    };

    await Seccion.create(datosSeccionUno);

    await expect(Seccion.create(datosSeccionDos)).rejects.toMatchObject({
      code: 11000
    });
  });

  it('debería rechazar una sección cuando el número de inscritos es negativo (-1)', async () => {
    const datosSeccionInvalida = {
      asignaturaId: new mongoose.Types.ObjectId(),
      periodoId: new mongoose.Types.ObjectId(),
      docenteId: new mongoose.Types.ObjectId(),
      sedeId: new mongoose.Types.ObjectId(),
      jornada: 'diurna',
      modalidad: 'presencial',
      letra: 'E',
      cupoMaximo: 30,
      inscritos: -1,
      bloques: [
        { dia: 0, inicioMin: 480, finMin: 530 }
      ]
    };

    await expect(Seccion.create(datosSeccionInvalida)).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  it('debería rechazar una sección con una modalidad inválida que no pertenezca al enum MODALIDADES', async () => {
    const datosSeccionModalidadInvalida = {
      asignaturaId: new mongoose.Types.ObjectId(),
      periodoId: new mongoose.Types.ObjectId(),
      docenteId: new mongoose.Types.ObjectId(),
      sedeId: new mongoose.Types.ObjectId(),
      jornada: 'diurna',
      modalidad: 'hibrida',
      letra: 'F',
      cupoMaximo: 30,
      bloques: [
        { dia: 0, inicioMin: 480, finMin: 530 }
      ]
    };

    await expect(Seccion.create(datosSeccionModalidadInvalida)).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  it('debería rechazar una sección con un arreglo de bloques vacío (bloques: [])', async () => {
    const datosSeccionBloquesVacios = {
      asignaturaId: new mongoose.Types.ObjectId(),
      periodoId: new mongoose.Types.ObjectId(),
      docenteId: new mongoose.Types.ObjectId(),
      sedeId: new mongoose.Types.ObjectId(),
      jornada: 'diurna',
      modalidad: 'presencial',
      letra: 'G',
      cupoMaximo: 30,
      bloques: []
    };

    await expect(Seccion.create(datosSeccionBloquesVacios)).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  it('debería rechazar una sección con una jornada inválida que no pertenezca al enum JORNADAS', async () => {
    const datosSeccionJornadaInvalida = {
      asignaturaId: new mongoose.Types.ObjectId(),
      periodoId: new mongoose.Types.ObjectId(),
      docenteId: new mongoose.Types.ObjectId(),
      sedeId: new mongoose.Types.ObjectId(),
      jornada: 'nocturna',
      modalidad: 'presencial',
      letra: 'H',
      cupoMaximo: 30,
      bloques: [
        { dia: 0, inicioMin: 480, finMin: 530 }
      ]
    };

    await expect(Seccion.create(datosSeccionJornadaInvalida)).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  it('debería rechazar una sección cuando el cupo máximo es 0 (violando el valor mínimo permitido)', async () => {
    const datosSeccionCupoMinimo = {
      asignaturaId: new mongoose.Types.ObjectId(),
      periodoId: new mongoose.Types.ObjectId(),
      docenteId: new mongoose.Types.ObjectId(),
      sedeId: new mongoose.Types.ObjectId(),
      jornada: 'diurna',
      modalidad: 'presencial',
      letra: 'I',
      cupoMaximo: 0,
      bloques: [
        { dia: 0, inicioMin: 480, finMin: 530 }
      ]
    };

    await expect(Seccion.create(datosSeccionCupoMinimo)).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });
});