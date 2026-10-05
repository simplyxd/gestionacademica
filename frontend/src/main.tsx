import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import './styles.css';
import { App } from './app/App';

// simplified: una ruta; incorporar router cuando existan otras pantallas.
if (window.location.pathname === '/') {
  window.history.replaceState(null, '', '/admin/usuarios');
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
