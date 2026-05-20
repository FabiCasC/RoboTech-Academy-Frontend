export type LessonStatus = 'completed' | 'active' | 'locked';

export interface Lesson {
  id: string;
  order: number;
  sidebarTitle: string;
  lessonTag: string;
  heading: string;
  paragraphs: string[];
  diagramTitle?: string;
  diagramImage?: string;
  showComponentViewer?: boolean;
}

export interface LearningModule {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  badge: string;
  title: string;
  description: string;
  progress: number;
  image: string;
  modules: LearningModule[];
}
