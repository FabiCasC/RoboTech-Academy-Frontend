import { RenderMode, ServerRoute } from '@angular/ssr';
import { KIT_CATALOG } from './pages/componentes/data/kit-catalog.data';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'components/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return KIT_CATALOG.map((item) => ({ id: item.id }));
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
