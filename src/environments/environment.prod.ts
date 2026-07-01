export const environment = {
  production: true,
  /**
   * Proxy serverless en Vercel (`api/railway/[...path].mjs`) → Railway.
   * Misma origen: sin CORS en el navegador.
   */
  apiUrl: '/api/railway'
};
