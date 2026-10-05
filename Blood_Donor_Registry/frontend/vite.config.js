import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The proxy forwards "/api" calls to the Express backend, so the browser never touches the database.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://localhost:5000' } },
});
