import { RenderMode, ServerRoute } from '@angular/ssr';
import { KIT_CATALOG } from './pages/componentes/data/kit-catalog.data';
import { COURSES, getAllLessons } from './pages/aprendizaje/data/courses.data';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'components/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return KIT_CATALOG.map((item) => ({ id: item.id }));
    }
  },
  {
    path: 'cursos/:courseId/leccion/:lessonId',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return COURSES.flatMap((course) =>
        getAllLessons(course).map((lesson) => ({
          courseId: course.id,
          lessonId: lesson.id
        }))
      );
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
