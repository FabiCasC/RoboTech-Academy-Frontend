const apiHost = 'http://localhost:8080';

export const environment = {
  production: false,
  /**
   * Host del servidor Spring (sin `/api`). Cambia `apiHost` si usas otro puerto.
   * CORS: Spring debe permitir el origen del `ng serve` (p. ej. http://localhost:4200 o :4300).
   */
  apiHost,
  apiUrl: `${apiHost}/api`,
  API_BASE_URL: `${apiHost}/api`
};
