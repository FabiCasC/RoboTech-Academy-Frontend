export const environment = {
  production: true,
  /**
   * Misma origen en Vercel: vercel.json reescribe /railway-api/* → Railway.
   * Evita CORS mientras el backend solo permite localhost:4200.
   */
  apiUrl: '/railway-api'
};
