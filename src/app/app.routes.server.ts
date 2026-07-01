import { RenderMode, ServerRoute } from '@angular/ssr';
import { KIT_CATALOG } from './pages/componentes/data/kit-catalog.data';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'proyectos/:projectId',
    renderMode: RenderMode.Server
  },
  {
    path: 'cursos/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'components/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return KIT_CATALOG.map((item) => ({ id: item.id }));
    }
  },
  {
    path: 'cursos/:courseId/leccion/:lessonId',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
