// Estilos globales primero: el CSS de cada componente se carga después y puede sobreescribirlos.
import './index.css';
import './App.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No se encontró el elemento #root');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
