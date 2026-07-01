import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CreateForumPostBody,
  ForumBountyDto,
  ForumLeaderboardEntry,
  ForumPostDto,
  JsonObject
} from './api.models';

@Injectable({ providedIn: 'root' })
export class ForumApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/forum`;

  listPosts(): Observable<ForumPostDto[]> {
    return this.http.get<ForumPostDto[]>(`${this.base}/posts`);
  }

  createPost(body: CreateForumPostBody): Observable<ForumPostDto> {
    return this.http.post<ForumPostDto>(`${this.base}/posts`, body);
  }

  likePost(id: string): Observable<JsonObject> {
    return this.http.post<JsonObject>(
      `${this.base}/posts/${encodeURIComponent(id)}/like`,
      {}
    );
  }

  leaderboard(): Observable<ForumLeaderboardEntry[]> {
    return this.http.get<ForumLeaderboardEntry[]>(`${this.base}/leaderboard`);
  }

  bounties(): Observable<ForumBountyDto[]> {
    return this.http.get<ForumBountyDto[]>(`${this.base}/bounties`);
  }
}
