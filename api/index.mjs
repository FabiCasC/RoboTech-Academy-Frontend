/**
 * Entrada serverless de Vercel para Angular SSR.
 * Delega en reqHandler exportado por el build (dist/robotech-frontend/server/server.mjs).
 */
export default async function handler(req, res) {
  const { reqHandler } = await import('../dist/robotech-frontend/server/server.mjs');
  return reqHandler(req, res);
}
