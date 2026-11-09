const { crearAzar } = require('./azar');

describe('crearAzar', () => {
  it('con la misma semilla produce la misma secuencia', () => {
    const a = crearAzar(42);
    const b = crearAzar(42);
    const serie = (azar) => Array.from({ length: 5 }, () => azar.siguiente());
    expect(serie(a)).toEqual(serie(b));
  });

  it('con otra semilla produce otra secuencia', () => {
    expect(crearAzar(1).siguiente()).not.toBe(crearAzar(2).siguiente());
  });

  it('siguiente() queda en [0, 1)', () => {
    const azar = crearAzar(7);
    for (let i = 0; i < 1000; i += 1) {
      const n = azar.siguiente();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it('entero(min, max) incluye ambos extremos', () => {
    const azar = crearAzar(3);
    const vistos = new Set(Array.from({ length: 500 }, () => azar.entero(1, 3)));
    expect([...vistos].sort()).toEqual([1, 2, 3]);
  });

  it('elegir() devuelve un elemento de la lista', () => {
    const azar = crearAzar(5);
    const lista = ['a', 'b', 'c'];
    expect(lista).toContain(azar.elegir(lista));
  });
});
