import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo, sirve las funciones de /api (las mismas que ejecuta Vercel) desde el servidor de Vite.
function apiLocal() {
  return {
    name: 'api-local',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/([a-z0-9-]+)(\?.*)?$/);
        if (!match) return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${match[1]}.js`);
          const handler = mod[req.method];
          if (!handler) {
            res.statusCode = 405;
            return res.end();
          }
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const request = new Request(`http://${req.headers.host}${req.url}`, {
            method: req.method,
            headers: req.headers,
            body: chunks.length ? Buffer.concat(chunks) : undefined,
          });
          const response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          server.ssrFixStacktrace(error);
          next(error);
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Las variables sin prefijo VITE_ (claves secretas) solo llegan a las funciones de /api, no al navegador.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    plugins: [react(), apiLocal()],
    test: { environment: 'node' },
  };
});
