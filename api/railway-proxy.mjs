/**
 * Proxy server-side hacia Railway (sin CORS del navegador).
 * Invocado vía rewrite: /api/railway/:path* → /api/railway-proxy?path=:path*
 */
const BACKEND = 'https://robotech-academy-backend-production.up.railway.app/api';

function resolvePath(req) {
  const pathParam = req.query.path;
  if (pathParam) {
    return Array.isArray(pathParam) ? pathParam.join('/') : String(pathParam);
  }

  const url = new URL(req.url ?? '/', 'http://localhost');
  const prefix = '/api/railway-proxy/';
  if (url.pathname.startsWith(prefix)) {
    return url.pathname.slice(prefix.length);
  }

  return '';
}

export default async function handler(req, res) {
  const path = resolvePath(req);

  const incoming = new URL(req.url ?? '/', 'http://localhost');
  const qs = [...incoming.searchParams.entries()]
    .filter(([key]) => key !== 'path')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  const target = `${BACKEND}/${path}${qs ? `?${qs}` : ''}`;

  const headers = {
    Accept: req.headers.accept ?? 'application/json',
    'Content-Type': req.headers['content-type'] ?? 'application/json'
  };
  if (req.headers.authorization) {
    headers.Authorization = req.headers.authorization;
  }

  const init = { method: req.method, headers };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (req.body !== undefined && req.body !== null) {
      init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }
  }

  try {
    const upstream = await fetch(target, init);
    const text = await upstream.text();
    res.status(upstream.status);

    const contentType = upstream.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    } else if (text.startsWith('{') || text.startsWith('[')) {
      res.setHeader('Content-Type', 'application/json');
    } else {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    }

    res.end(text);
  } catch (err) {
    res.status(502);
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        message: 'No se pudo contactar al backend en Railway.',
        error: err instanceof Error ? err.message : String(err)
      })
    );
  }
}
