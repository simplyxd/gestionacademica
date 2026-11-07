import { ColorSchemeScript } from '@mantine/core';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ThemeProvider } from './theme/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorSchemeScript defaultColorScheme="auto" />
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
