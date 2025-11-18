// frontend/src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://backend:8080', // Имя сервиса backend в Docker
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Убираем префикс /api, так как он уже включен в URL
      },
    })
  );
};