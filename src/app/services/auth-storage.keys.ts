/** Claves de localStorage compartidas entre AuthService e interceptores (evita dependencia circular Http ↔ AuthService). */
export const ROBO_AUTH_STORAGE = {
  session: 'robotech_session',
  accessToken: 'robotech_access_token'
} as const;
