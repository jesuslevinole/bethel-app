import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// cssCodeSplit: false a propósito: un solo CSS para que los modales nunca queden sin estilo.
// Firebase y React van en chunks propios: cambian poco, así el navegador los reutiliza entre deploys.
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 700,
    cssCodeSplit: false,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'firebase', test: /node_modules[\\/](@firebase|firebase)[\\/]/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
  plugins: [react()],
});
