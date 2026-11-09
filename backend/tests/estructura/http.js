// Helpers HTTP para los tests de rutas de estructura: crea usuarios reales (authenticate los recarga de la BD)
// y firma tokens con el secreto de prueba.
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { Usuario } from '../../src/models/usuario.model.js';
import { SECRETO_DE_PRUEBA, crearAppDePrueba } from '../helpers/app.js';

export const app = crearAppDePrueba();

const RUTS = ['12345678-5', '11111111-1', '22222222-2', '1000005-K', '1000013-0', '1000019-K'];
let n = 0;
export const reiniciarSecuencia = () => {
  n = 0;
};

export async function crearUsuario(rol, sedes = []) {
  const i = n++;
  return Usuario.create({
    rut: RUTS[i],
    nombre: `Persona ${i}`,
    correo: `persona${i}@iunf.cl`,
    telefono: '+56955550199',
    passwordHash: '$2a$12$relleno.relleno.relleno.relleno.relleno.relleno.rellen',
    rol,
    sedes,
    estado: 'activo',
    incorporacion: '2024-03-01',
  });
}

/** Cliente con el token del usuario: como(u).get('/api/sedes'). */
export function como(usuario) {
  const token = jwt.sign({ sub: usuario.id, rol: usuario.rol, sedes: usuario.sedes.map(String) }, SECRETO_DE_PRUEBA, { expiresIn: '1h' });
  const con = (r) => r.set('Authorization', `Bearer ${token}`);
  return {
    get: (url) => con(request(app).get(url)),
    post: (url) => con(request(app).post(url)),
    patch: (url) => con(request(app).patch(url)),
    put: (url) => con(request(app).put(url)),
  };
}

export const sinToken = (metodo, url) => request(app)[metodo](url);
