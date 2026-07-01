export type LabProjectKind = 'COURSE' | 'FREE';

export type LabProject = {
  id: string;
  kind: LabProjectKind;
  title: string;
  description: string;
  courseSlug?: string;
  submitted?: boolean;
  createdAt: string;
  updatedAt: string;
};

