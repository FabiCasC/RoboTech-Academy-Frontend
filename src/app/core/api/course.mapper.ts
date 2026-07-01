import type {
  Course,
  CourseConnection,
  CourseControlState,
  CourseModule,
  CoursePractice,
  CourseProject,
  CourseSpecGroup,
  CourseSpecs
} from '../../data/course.models';
import type { Course as LearningCourse, Lesson, LearningModule } from '../../pages/aprendizaje/models/learning.models';
import type { JsonObject } from './api.models';

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : value != null ? String(value) : fallback;
}

/** Lección en API: string o objeto `{ title, heading, sidebarTitle, ... }`. */
function lessonTitleFromDto(raw: unknown): string {
  if (typeof raw === 'string') {
    const t = raw.trim();
    return t || 'Lección';
  }
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    const label = asString(
      o['sidebarTitle'] ?? o['title'] ?? o['heading'] ?? o['lessonTag'] ?? o['name'] ?? o['id'],
      ''
    ).trim();
    return label || 'Lección';
  }
  return 'Lección';
}

function mapPractice(raw: unknown): CoursePractice | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const kind = asString(o['kind']);
  const id = asString(o['id']);
  const title = asString(o['title']);
  const description = asString(o['description']);
  if (!kind || !id) return null;

  if (kind === 'checklist') {
    return {
      kind: 'checklist',
      id,
      title,
      description,
      items: asArray(o['items']).map((i) => asString(i))
    };
  }
  if (kind === 'quiz') {
    return {
      kind: 'quiz',
      id,
      title,
      description,
      questions: asArray(o['questions']).map((q) => {
        const row = q as Record<string, unknown>;
        return {
          prompt: asString(row['prompt']),
          options: asArray(row['options']).map((opt) => asString(opt)),
          answerIndex: Number(row['answerIndex'] ?? 0)
        };
      })
    };
  }
  if (kind === 'wiring') {
    return {
      kind: 'wiring',
      id,
      title,
      description,
      rows: asArray(o['rows']).map((r) => {
        const row = r as Record<string, unknown>;
        return {
          component: asString(row['component']),
          componentPin: asString(row['componentPin']),
          expectedArduinoPin: asString(row['expectedArduinoPin']),
          choices: asArray(row['choices']).map((c) => asString(c))
        };
      })
    };
  }
  if (kind === 'state-machine') {
    return {
      kind: 'state-machine',
      id,
      title,
      description,
      actions: asArray(o['actions']).map((a) => asString(a)),
      cases: asArray(o['cases']).map((c) => {
        const row = c as Record<string, unknown>;
        return {
          left: asString(row['left'], 'BLANCO') as 'BLANCO' | 'NEGRO',
          right: asString(row['right'], 'BLANCO') as 'BLANCO' | 'NEGRO',
          expectedAction: asString(row['expectedAction'])
        };
      })
    };
  }
  return null;
}

function mapModule(raw: unknown): CourseModule {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    id: asString(o['id']),
    title: asString(o['title']),
    duration: asString(o['duration']),
    summary: asString(o['summary']),
    lessons: asArray(o['lessons']).map((l) => lessonTitleFromDto(l)),
    practices: asArray(o['practices'])
      .map((p) => mapPractice(p))
      .filter((p): p is CoursePractice => p !== null)
  };
}

function mapProject(raw: unknown): CourseProject {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    title: asString(o['title']),
    objective: asString(o['objective']),
    deliverables: asArray(o['deliverables']).map((d) => asString(d)),
    tools: asArray(o['tools']).map((t) => asString(t))
  };
}

function mapSpecGroup(raw: unknown): CourseSpecGroup {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    title: asString(o['title']),
    items: asArray(o['items']).map((i) => asString(i))
  };
}

function mapConnection(raw: unknown): CourseConnection {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    component: asString(o['component']),
    componentPin: asString(o['componentPin']),
    arduinoPin: asString(o['arduinoPin'])
  };
}

function mapControlState(raw: unknown): CourseControlState {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    state: asString(o['state']),
    behavior: asString(o['behavior'])
  };
}

function mapSpecs(raw: unknown): CourseSpecs | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  return {
    introTitle: asString(o['introTitle']),
    introText: asString(o['introText']),
    referenceVideo: asString(o['referenceVideo']),
    materialsTitle: asString(o['materialsTitle']),
    materialsGroups: asArray(o['materialsGroups']).map((g) => mapSpecGroup(g)),
    connectionsTitle: asString(o['connectionsTitle']),
    connections: asArray(o['connections']).map((c) => mapConnection(c)),
    controlTitle: asString(o['controlTitle']),
    controlStates: asArray(o['controlStates']).map((s) => mapControlState(s))
  };
}

export function mapCourseDto(dto: JsonObject): Course {
  const slug = asString(dto['slug'] ?? dto['id']);
  return {
    slug,
    badge: asString(dto['badge']),
    title: asString(dto['title']),
    subtitle: asString(dto['subtitle']),
    description: asString(dto['description']),
    overview: asString(dto['overview'] ?? dto['description']),
    progress: Number(dto['progress'] ?? 0),
    image: asString(dto['imageUrl'] ?? dto['image']),
    project: mapProject(dto['project']),
    modules: asArray(dto['modules']).map((m) => mapModule(m)),
    specs: mapSpecs(dto['specs'])
  };
}

function mapLesson(raw: unknown, order: number): Lesson {
  const o = (raw ?? {}) as Record<string, unknown>;
  return {
    id: asString(o['id']),
    order: Number(o['order'] ?? order),
    sidebarTitle: asString(o['sidebarTitle'] ?? o['title']),
    lessonTag: asString(o['lessonTag'] ?? `LECCIÓN ${order}`),
    heading: asString(o['heading'] ?? o['title']),
    paragraphs: asArray(o['paragraphs']).map((p) => asString(p)),
    diagramTitle: o['diagramTitle'] ? asString(o['diagramTitle']) : undefined,
    diagramImage: o['diagramImage'] ? asString(o['diagramImage']) : undefined,
    showComponentViewer: Boolean(o['showComponentViewer'])
  };
}

function mapLearningModule(raw: unknown, index: number): LearningModule {
  const o = (raw ?? {}) as Record<string, unknown>;
  const lessons = asArray(o['lessons']).map((l, i) => mapLesson(l, i + 1));
  return {
    id: asString(o['id'], `mod-${index + 1}`),
    number: Number(o['number'] ?? index + 1),
    title: asString(o['title']),
    subtitle: asString(o['subtitle'] ?? o['summary']),
    lessons
  };
}

export function mapLearningCourseDto(dto: JsonObject): LearningCourse {
  const id = asString(dto['slug'] ?? dto['id']);
  return {
    id,
    badge: asString(dto['badge']),
    title: asString(dto['title']),
    description: asString(dto['description']),
    progress: Number(dto['progress'] ?? 0),
    image: asString(dto['imageUrl'] ?? dto['image']),
    modules: asArray(dto['modules']).map((m, i) => mapLearningModule(m, i))
  };
}

export function flattenLessons(course: LearningCourse): Lesson[] {
  return course.modules.flatMap((m) => m.lessons);
}

export function findLesson(course: LearningCourse, lessonId: string): Lesson | undefined {
  return flattenLessons(course).find((l) => l.id === lessonId);
}

export function totalPractices(course: Course): number {
  return course.modules.reduce((sum, module) => sum + (module.practices?.length ?? 0), 0);
}
