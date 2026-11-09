import { describe, it, expect } from 'vitest';
import { bloquesSeSolapan, validarBloque, buscarSolapes } from '../../src/utils/horario.js';

describe('Utilidad de Horario - Verificación de Solapamiento y Validación', () => {
  it('debería retornar false (sin solape) para dos bloques contiguos en el mismo día [480, 500) y [500, 530)', () => {
    const bloqueA = { dia: 0, inicioMin: 480, finMin: 500 };
    const bloqueB = { dia: 0, inicioMin: 500, finMin: 530 };

    const resultado = bloquesSeSolapan(bloqueA, bloqueB);

    expect(resultado).toBe(false);
  });

  it('debería retornar true (con solape) para dos bloques que se cruzan en el mismo día [480, 520) y [500, 540)', () => {
    const bloqueA = { dia: 0, inicioMin: 480, finMin: 520 };
    const bloqueB = { dia: 0, inicioMin: 500, finMin: 540 };

    const resultado = bloquesSeSolapan(bloqueA, bloqueB);

    expect(resultado).toBe(true);
  });

  it('debería retornar false (sin solape) para dos bloques con el mismo horario en días distintos (dia 0 vs dia 1)', () => {
    const bloqueA = { dia: 0, inicioMin: 480, finMin: 520 };
    const bloqueB = { dia: 1, inicioMin: 480, finMin: 520 };

    const resultado = bloquesSeSolapan(bloqueA, bloqueB);

    expect(resultado).toBe(false);
  });

  it('debería retornar true (con solape) para un bloque completamente contenido dentro de otro en el mismo día [480, 540) y [500, 520)', () => {
    const bloqueA = { dia: 0, inicioMin: 480, finMin: 540 };
    const bloqueB = { dia: 0, inicioMin: 500, finMin: 520 };

    const resultado = bloquesSeSolapan(bloqueA, bloqueB);

    expect(resultado).toBe(true);
  });

  it('debería retornar true (con solape) para dos bloques del mismo día que empiezan en el mismo minuto 480 [480, 520) y [480, 540)', () => {
    const bloqueA = { dia: 0, inicioMin: 480, finMin: 520 };
    const bloqueB = { dia: 0, inicioMin: 480, finMin: 540 };

    const resultado = bloquesSeSolapan(bloqueA, bloqueB);

    expect(resultado).toBe(true);
  });

  it('debería retornar false (sin solape) para dos bloques de un minuto contiguos en el mismo día [500, 501) y [501, 502)', () => {
    const bloqueA = { dia: 0, inicioMin: 500, finMin: 501 };
    const bloqueB = { dia: 0, inicioMin: 501, finMin: 502 };

    const resultado = bloquesSeSolapan(bloqueA, bloqueB);

    expect(resultado).toBe(false);
  });

  it('debería lanzar un error para un bloque con rango inválido donde inicio es igual a fin [500, 500)', () => {
    const bloqueInvalido = { dia: 0, inicioMin: 500, finMin: 500 };

    expect(() => validarBloque(bloqueInvalido)).toThrow(
      'El minuto de inicio debe ser estrictamente menor que el minuto de fin'
    );
  });

  it('debería lanzar un error para un bloque donde inicioMin es mayor que finMin [600, 500)', () => {
    const bloqueInvalido = { dia: 0, inicioMin: 600, finMin: 500 };

    expect(() => validarBloque(bloqueInvalido)).toThrow(
      'El minuto de inicio debe ser estrictamente menor que el minuto de fin'
    );
  });

  it('debería lanzar un error para un bloque con un día fuera del rango válido [0-5] o no entero (ej. dia -1, 6 o 1.5)', () => {
    expect(() => validarBloque({ dia: -1, inicioMin: 480, finMin: 520 })).toThrow(
      'El día debe ser un número entero entre 0 y 5'
    );
    expect(() => validarBloque({ dia: 6, inicioMin: 480, finMin: 520 })).toThrow(
      'El día debe ser un número entero entre 0 y 5'
    );
    expect(() => validarBloque({ dia: 1.5, inicioMin: 480, finMin: 520 })).toThrow(
      'El día debe ser un número entero entre 0 y 5'
    );
  });

  it('debería aceptar finMin exactamente en el límite de 1440 como un valor válido', () => {
    const bloqueLimite = { dia: 0, inicioMin: 1400, finMin: 1440 };
    expect(() => validarBloque(bloqueLimite)).not.toThrow();
  });

  it('debería lanzar un error si inicioMin es negativo o no entero, o si finMin excede 1440 o no es entero', () => {
    expect(() => validarBloque({ dia: 0, inicioMin: -10, finMin: 520 })).toThrow(
      'El minuto de inicio debe ser un entero mayor o igual a 0'
    );
    expect(() => validarBloque({ dia: 0, inicioMin: 480.5, finMin: 520 })).toThrow(
      'El minuto de inicio debe ser un entero mayor o igual a 0'
    );
    expect(() => validarBloque({ dia: 0, inicioMin: 480, finMin: 5000 })).toThrow(
      'El minuto de fin debe ser un entero menor o igual a 1440'
    );
    expect(() => validarBloque({ dia: 0, inicioMin: 480, finMin: 520.5 })).toThrow(
      'El minuto de fin debe ser un entero menor o igual a 1440'
    );
  });

  it('debería retornar los bloques de listaA que se solapan con al menos un bloque de listaB al invocar buscarSolapes', () => {
    const listaA = [
      { dia: 0, inicioMin: 500, finMin: 530 },
      { dia: 0, inicioMin: 600, finMin: 650 }
    ];
    const listaB = [
      { dia: 0, inicioMin: 480, finMin: 510 },
      { dia: 1, inicioMin: 500, finMin: 530 }
    ];

    const solapados = buscarSolapes(listaA, listaB);

    expect(solapados).toHaveLength(1);
    expect(solapados[0]).toEqual(listaA[0]);
  });

  it('debería validar todos los bloques de listaB incluso si listaA está vacía al invocar buscarSolapes', () => {
    const listaA = [];
    const listaB = [
      { dia: 0, inicioMin: 500, finMin: 500 } // Bloque inválido en listaB
    ];

    expect(() => buscarSolapes(listaA, listaB)).toThrow(
      'El minuto de inicio debe ser estrictamente menor que el minuto de fin'
    );
  });
});