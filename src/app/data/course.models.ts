export type ChecklistPractice = {
  kind: 'checklist';
  id: string;
  title: string;
  description: string;
  items: string[];
};

export type QuizPractice = {
  kind: 'quiz';
  id: string;
  title: string;
  description: string;
  questions: Array<{
    prompt: string;
    options: string[];
    answerIndex: number;
  }>;
};

export type WiringPractice = {
  kind: 'wiring';
  id: string;
  title: string;
  description: string;
  rows: Array<{
    component: string;
    componentPin: string;
    expectedArduinoPin: string;
    choices: string[];
  }>;
};

export type StateMachinePractice = {
  kind: 'state-machine';
  id: string;
  title: string;
  description: string;
  actions: string[];
  cases: Array<{
    left: 'BLANCO' | 'NEGRO';
    right: 'BLANCO' | 'NEGRO';
    expectedAction: string;
  }>;
};

export type CoursePractice =
  | ChecklistPractice
  | QuizPractice
  | WiringPractice
  | StateMachinePractice;

export type CourseModule = {
  id: string;
  title: string;
  duration: string;
  summary: string;
  lessons: string[];
  practices: CoursePractice[];
};

export type CourseProject = {
  title: string;
  objective: string;
  deliverables: string[];
  tools: string[];
};

export type CourseSpecGroup = {
  title: string;
  items: string[];
};

export type CourseConnection = {
  component: string;
  componentPin: string;
  arduinoPin: string;
};

export type CourseControlState = {
  state: string;
  behavior: string;
};

export type CourseSpecs = {
  introTitle: string;
  introText: string;
  referenceVideo: string;
  materialsTitle: string;
  materialsGroups: CourseSpecGroup[];
  connectionsTitle: string;
  connections: CourseConnection[];
  controlTitle: string;
  controlStates: CourseControlState[];
};

export type Course = {
  slug: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  overview: string;
  progress: number;
  image: string;
  project: CourseProject;
  modules: CourseModule[];
  specs?: CourseSpecs;
};
