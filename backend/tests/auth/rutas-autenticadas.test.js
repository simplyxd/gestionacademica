import { describe, expect, it } from 'vitest';
import { crearAppDePrueba } from '../helpers/app.js';

// D-09: toda ruta registrada lleva authenticate, salvo las dos públicas.
const PUBLICAS = new Set(['GET /api/health', 'POST /api/auth/login']);

const SUFIJO_MONTAJE = '(?:\\/$)?(?=\\/|$)';
const SUFIJO_RUTA = '(?:\\/$)?$';

function rutaDesdeFuente(fuente) {
  let cuerpo = fuente.startsWith('^') ? fuente.slice(1) : fuente;
  if (cuerpo.endsWith(SUFIJO_MONTAJE)) cuerpo = cuerpo.slice(0, -SUFIJO_MONTAJE.length);
  else if (cuerpo.endsWith(SUFIJO_RUTA)) cuerpo = cuerpo.slice(0, -SUFIJO_RUTA.length);
  else throw new Error(`No reconozco el montaje: ${fuente}`);

  if (cuerpo.startsWith('(?:') && cuerpo.endsWith(')')) cuerpo = cuerpo.slice(3, -1);
  cuerpo = cuerpo.replace(/\(\[\^\\\/\]\+\)/g, ':param');
  cuerpo = cuerpo.replace(/\\\//g, '/');
  if (!cuerpo.startsWith('/')) cuerpo = `/${cuerpo}`;
  return cuerpo;
}

/** Express 5 no guarda el path del montaje: está dentro del matcher. Lo leemos de su regexp. */
function fuenteDe(capa) {
  const matcher = capa.matchers?.[0];
  if (typeof matcher !== 'function') throw new Error(`Sin matcher en ${capa.name}`);

  const original = RegExp.prototype.exec;
  let hallada = null;
  RegExp.prototype.exec = function capturar(texto) {
    hallada = this;
    return original.call(this, texto);
  };
  try {
    matcher('\0');
  } finally {
    RegExp.prototype.exec = original;
  }
  if (!hallada) throw new Error(`No pude leer la ruta de ${capa.name}`);
  return hallada.source;
}

function unir(base, segmento) {
  if (!segmento || segmento === '/') return base || '/';
  const izquierda = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${izquierda}${segmento.startsWith('/') ? segmento : `/${segmento}`}`;
}

function prefijoDe(capa) {
  if (capa.slash) return '';
  return rutaDesdeFuente(fuenteDe(capa));
}

function recorrer(router, prefijo, heredado, rutas) {
  let cubierto = heredado;
  for (const capa of router.stack ?? []) {
    if (capa.route) {
      const propia = capa.route.stack.some((entrada) => entrada.handle?.esAutenticacion === true);
      for (const metodo of Object.keys(capa.route.methods)) {
        if (metodo.startsWith('_')) continue;
        if (typeof capa.route.path !== 'string') throw new Error(`Ruta no textual: ${capa.route.path}`);
        rutas.push({
          metodo: metodo.toUpperCase(),
          ruta: unir(prefijo, capa.route.path),
          autenticada: cubierto || propia,
        });
      }
      continue;
    }
    if (capa.handle?.esAutenticacion === true) {
      cubierto = true;
      continue;
    }
    if (Array.isArray(capa.handle?.stack)) {
      recorrer(capa.handle, unir(prefijo, prefijoDe(capa)), cubierto, rutas);
    }
  }
}

function listarRutas(app) {
  const rutas = [];
  recorrer(app.router, '', false, rutas);
  return rutas;
}

const clave = (ruta) => `${ruta.metodo} ${ruta.ruta}`;

describe('rutas registradas', () => {
  it('exige authenticate en todas menos GET /api/health y POST /api/auth/login', () => {
    const rutas = listarRutas(crearAppDePrueba());
    const publicas = rutas.filter((ruta) => PUBLICAS.has(clave(ruta)));
    const protegidas = rutas.filter((ruta) => !PUBLICAS.has(clave(ruta)));
    const sinAuthenticate = protegidas.filter((ruta) => !ruta.autenticada).map(clave);

    expect(publicas.map(clave).sort()).toEqual([...PUBLICAS].sort());
    expect(publicas.every((ruta) => ruta.autenticada)).toBe(false);
    expect(protegidas.map(clave)).toEqual(
      expect.arrayContaining(['GET /api/auth/me', 'POST /api/auth/cambiar-clave', 'GET /api/permisos']),
    );
    expect(sinAuthenticate).toEqual([]);
  });
});
