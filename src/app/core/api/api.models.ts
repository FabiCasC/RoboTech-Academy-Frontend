/** DTOs flexibles alineados con Spring; extiende según contratos reales. */

export type JsonObject = Record<string, unknown>;

export interface AuthMeResponse {
  user?: {
    uid?: string;
    email?: string;
    role?: string;
  };
}

export interface ForumPostDto {
  id?: string;
  title?: string;
  content?: string;
  authorName?: string;
  authorAvatar?: string;
  authorTitle?: string;
  time?: string;
  likes?: number;
  comments?: number;
  badges?: Array<{ label: string; value: string }>;
  mediaUrl?: string;
  [key: string]: unknown;
}

export interface ForumLeaderboardEntry {
  rank?: string;
  name?: string;
  xp?: string;
  avatar?: string;
  initials?: string;
  [key: string]: unknown;
}

export interface ForumBountyDto {
  title?: string;
  detail?: string;
  tag?: string;
  xp?: string;
  [key: string]: unknown;
}

export interface CreateForumPostBody {
  title: string;
  content: string;
}

export interface CircuitValidateRequest {
  components: JsonObject[];
  connections: JsonObject[];
  firmwareCode: string;
  projectType?: string;
}

export interface CircuitPersistBody {
  components: JsonObject[];
  connections: JsonObject[];
  firmwareCode: string;
}

export interface ProgressMeBody {
  activeCourses?: string[];
  courseProgress?: JsonObject;
  badges?: string[];
  xp?: number;
}
