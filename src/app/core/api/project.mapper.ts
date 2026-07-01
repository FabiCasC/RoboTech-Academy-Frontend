import type { LabProject } from '../../pages/proyectos/models/lab-project.models';

/** Normaliza respuesta Spring (camelCase o snake_case) → modelo del laboratorio. */
export function mapProjectDtoToLabProject(d: Record<string, unknown>): LabProject {
  const id = String(d['id'] ?? d['uuid'] ?? '');
  const title = String(d['title'] ?? 'Proyecto');
  const description = String(d['description'] ?? '');
  const createdAt = String(
    d['createdAt'] ?? d['created_at'] ?? new Date().toISOString()
  );
  const updatedAt = String(d['updatedAt'] ?? d['updated_at'] ?? createdAt);
  const courseSlugRaw = d['courseSlug'] ?? d['course_slug'];
  const courseSlug =
    courseSlugRaw !== undefined && courseSlugRaw !== null
      ? String(courseSlugRaw)
      : undefined;
  const kind: LabProject['kind'] = courseSlug ? 'COURSE' : 'FREE';
  const submitted = d['submitted'] === true;
  return { id, kind, title, description, courseSlug, submitted, createdAt, updatedAt };
}
