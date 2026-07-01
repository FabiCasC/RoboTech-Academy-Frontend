import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ROLE_PROFILES } from '../../core/models/system-roles.models';
import { UsersApiService } from '../../core/api/users-api.service';
import type { JsonObject } from '../../core/api/api.models';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly usersApi = inject(UsersApiService);

  readonly session = this.auth.getSession();
  readonly roleProfile = this.session ? ROLE_PROFILES[this.session.role] : null;

  user = {
    name: this.session?.displayName ?? 'Usuario',
    role: this.roleProfile?.label ?? '—',
    roleCode: this.session?.role ?? '—',
    id: this.session?.email?.split('@')[0]?.toUpperCase() ?? '—',
    level: 1,
    xp: 0,
    maxXp: 10000
  };

  stats: Array<{
    title: string;
    value: string;
    detail?: string;
    icon: string;
    trendClass?: string;
    activeDot?: boolean;
    progressBar?: boolean;
    progressValue?: number;
  }> = [];

  badges: Array<{ name: string; icon: string; unlocked: boolean }> = [];

  activityLog: Array<{
    title: string;
    time: string;
    tag: string;
    pulse?: boolean;
    xpBadge?: string;
    sliders?: boolean;
  }> = [];

  apiHint: string | null = null;

  ngOnInit(): void {
    this.setDefaults();
    forkJoin({
      me: this.usersApi.getMe().pipe(catchError(() => of(null))),
      stats: this.usersApi.getMeStats().pipe(catchError(() => of(null))),
      achievements: this.usersApi.getMeAchievements().pipe(catchError(() => of(null))),
      activity: this.usersApi.getMeActivity().pipe(catchError(() => of(null)))
    }).subscribe({
      next: ({ me, stats, achievements, activity }) => {
        this.applyMe(me as JsonObject | null);
        this.stats = this.buildStats(stats as JsonObject | null);
        this.badges = this.buildBadges(achievements as JsonObject | null);
        this.activityLog = this.buildActivity(activity as JsonObject | null);
      },
      error: () => {
        this.apiHint = 'No se pudo cargar el perfil remoto; se muestran datos locales.';
        this.setDefaults();
      }
    });
  }

  private applyMe(me: JsonObject | null): void {
    if (!me) {
      return;
    }
    const display =
      (me['displayName'] as string | undefined) ??
      (me['name'] as string | undefined) ??
      (me['email'] as string | undefined);
    if (display) this.user.name = display;
    const uid = (me['uid'] as string | undefined) ?? (me['id'] as string | undefined);
    if (uid) this.user.id = uid.toUpperCase();
    const xp = me['xp'] as number | undefined;
    if (typeof xp === 'number') this.user.xp = xp;
    const lvl = me['level'] as number | undefined;
    if (typeof lvl === 'number') this.user.level = lvl;
  }

  private buildStats(d: JsonObject | null) {
    if (!d) return this.defaultStats();
    const entries = Object.entries(d).filter(
      ([, v]) => typeof v === 'string' || typeof v === 'number'
    );
    if (!entries.length) return this.defaultStats();
    return entries.slice(0, 4).map(([k, v]) => ({
      title: k.toUpperCase().replace(/_/g, ' '),
      value: String(v),
      icon: 'analytics',
      detail: ''
    }));
  }

  private buildBadges(d: JsonObject | null) {
    const raw = d?.['badges'] ?? d?.['items'] ?? d?.['achievements'];
    if (!Array.isArray(raw)) {
      return this.defaultBadges();
    }
    return (raw as JsonObject[]).map((b, i) => ({
      name: String(b['name'] ?? b['title'] ?? `Logro ${i + 1}`),
      icon: String(b['icon'] ?? 'military_tech'),
      unlocked: Boolean(b['unlocked'] ?? b['earned'] ?? true)
    }));
  }

  private buildActivity(d: JsonObject | null) {
    const raw = d?.['events'] ?? d?.['items'] ?? d?.['activities'];
    if (!Array.isArray(raw)) {
      return this.defaultActivity();
    }
    return (raw as JsonObject[]).map((e, i) => ({
      title: String(e['title'] ?? e['message'] ?? `Evento ${i + 1}`),
      time: String(e['time'] ?? e['at'] ?? ''),
      tag: String(e['tag'] ?? e['type'] ?? 'ACTIVIDAD')
    }));
  }

  private setDefaults(): void {
    this.stats = this.defaultStats();
    this.badges = this.defaultBadges();
    this.activityLog = this.defaultActivity();
  }

  private defaultStats() {
    return [
      {
        title: 'PROYECTOS COMPLETADOS',
        value: '—',
        detail: 'Sincroniza con /api/users/me/stats',
        icon: 'precision_manufacturing',
        trendClass: 'trend-up'
      },
      {
        title: 'HORAS DE SIMULACIÓN',
        value: '—',
        detail: 'Sesión activa recientemente',
        icon: 'timer',
        activeDot: true
      },
      {
        title: 'COMPONENTES DOMINADOS',
        value: '—',
        icon: 'memory_alt',
        progressBar: true,
        progressValue: 0
      },
      {
        title: 'TASA DE PRECISIÓN',
        value: '—',
        detail: 'Óptimo',
        icon: 'center_focus_strong',
        trendClass: 'trend-nominal'
      }
    ];
  }

  private defaultBadges() {
    return [
      { name: 'MAESTRO DE CIRCUITOS', icon: 'bolt', unlocked: true },
      { name: 'NINJA DEL CÓDIGO', icon: 'code', unlocked: true },
      { name: 'PRIMER ENSAMBLAJE', icon: 'build', unlocked: true },
      { name: 'CLASE TITANIO', icon: 'lock', unlocked: false }
    ];
  }

  private defaultActivity() {
    return [
      {
        title: 'Sin actividad remota todavía',
        time: '—',
        tag: 'API /users/me/activity',
        pulse: false
      }
    ];
  }
}
