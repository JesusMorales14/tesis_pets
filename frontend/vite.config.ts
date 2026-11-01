import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 4201,
    headers: {
      // Override CSP header from Vite dev server to allow scripts
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:4201; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http://localhost:8000; connect-src 'self' http://localhost:4201 http://localhost:8000 ws://localhost:4201 https://dog.ceo https://api.thecatapi.com; font-src 'self' data:; frame-src https://www.google.com https://maps.google.com;",
    },
  },
});