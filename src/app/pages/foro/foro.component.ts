import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ForumApiService } from '../../core/api/forum-api.service';
import type {
  ForumBountyDto,
  ForumLeaderboardEntry,
  ForumPostDto
} from '../../core/api/api.models';
import { extractHttpErrorMessage } from '../../core/api/http-error.util';

@Component({
  selector: 'app-foro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './foro.component.html',
  styleUrl: './foro.component.css'
})
export class ForoComponent implements OnInit {
  private readonly forum = inject(ForumApiService);

  uiHint: string | null = null;
  loadError: string | null = null;

  draftTitle = '';
  draftContent = '';

  currentUser = {
    avatar: 'perfil.png'
  };

  posts: ForumPostDto[] = [];
  topEngineers: ForumLeaderboardEntry[] = [];
  bounties: ForumBountyDto[] = [];

  ngOnInit(): void {
    this.reloadFeed();
  }

  private reloadFeed(): void {
    this.loadError = null;
    forkJoin({
      posts: this.forum.listPosts().pipe(catchError(() => of([]))),
      leaderboard: this.forum.leaderboard().pipe(catchError(() => of([]))),
      bounties: this.forum.bounties().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ posts, leaderboard, bounties }) => {
        this.posts = Array.isArray(posts) ? posts : [];
        this.topEngineers = Array.isArray(leaderboard) ? leaderboard : [];
        this.bounties = Array.isArray(bounties) ? bounties : [];
      },
      error: (err) => (this.loadError = extractHttpErrorMessage(err))
    });
  }

  onPostData(): void {
    const title = this.draftTitle.trim();
    const content = this.draftContent.trim();
    if (!title || !content) {
      this.uiHint = 'Escribe título y contenido antes de publicar.';
      return;
    }
    this.forum.createPost({ title, content }).subscribe({
      next: (created) => {
        this.posts = [created, ...this.posts];
        this.draftTitle = '';
        this.draftContent = '';
        this.uiHint = 'Publicación creada en el servidor.';
      },
      error: (err) => (this.uiHint = extractHttpErrorMessage(err))
    });
  }

  onToolClick(tool: string): void {
    this.uiHint = `Herramienta «${tool}»: pendiente de integración con adjuntos en el backend.`;
  }

  likePost(id: string | number | undefined): void {
    if (id === undefined || id === null) return;
    this.forum.likePost(String(id)).subscribe({
      next: () => {
        this.uiHint = 'Like registrado.';
        this.reloadFeed();
      },
      error: (err) => (this.uiHint = extractHttpErrorMessage(err))
    });
  }
}
