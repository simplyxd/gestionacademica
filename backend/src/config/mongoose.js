import mongoose from 'mongoose';
import { toJSONPlugin } from '../utils/toJSONPlugin.js';

// Plugin GLOBAL (decisión 3A): se aplica a todos los esquemas, así ningún dueño de dominio tiene que acordarse.
// Debe registrarse ANTES de que se compile cualquier modelo; por eso app.js importa este archivo primero.
mongoose.plugin(toJSONPlugin);
