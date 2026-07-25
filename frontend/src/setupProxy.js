const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Prefer explicit override; default to 127.0.0.1 for local `npm start`.
  // Use 127.0.0.1 (not localhost) to avoid Windows IPv6 (::1) proxy hangs.
  // In Docker Compose, set REACT_APP_PROXY_TARGET=http://iso-backend:8000
  const target = process.env.REACT_APP_PROXY_TARGET || 'http://127.0.0.1:8000';

  console.log('Setting up proxy middleware...');
  console.log(`Proxy target: ${target}`);

  // Use pathFilter (not app.use('/api/v1', ...)) so the full /api/v1/... path
  // is preserved. Mounting at /api/v1 strips that prefix and causes backend 404s.
  app.use(
    createProxyMiddleware({
      target,
      changeOrigin: true,
      secure: false,
      pathFilter: '/api/v1',
      logger: console,
      on: {
        error: (err, req, res) => {
          console.error('Proxy error:', err.message);
          if (res && !res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: false,
              message: `Backend proxy failed (${target}): ${err.message}`,
            }));
          }
        },
      },
    })
  );

  console.log('✅ Proxy middleware setup complete');
};
