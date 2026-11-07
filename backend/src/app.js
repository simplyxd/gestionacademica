import express from 'express';
import routes from './routes/index.js';

// La app se construye aquí, pero NO escucha en ningún puerto ni conecta a la base (D-03).
// Eso lo hace server.js; así los tests pueden importar la app sin efectos secundarios.
const app = express();

// Todos los endpoints del contrato cuelgan de /api.
app.use('/api', routes);

export default app;
