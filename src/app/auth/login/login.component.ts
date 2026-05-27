import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { ROLE_PROFILES, type SystemRole } from '../../core/models/system-roles.models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly roleProfiles = ROLE_PROFILES;
  readonly demoAccounts = this.auth.getDemoAccounts();
  readonly apiBaseUrl = environment.apiUrl;

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(1)]]
  });

  onLogin(): void {
    console.log('Intentando conectar...');
    this.errorMessage.set(null);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage.set('Revisa el correo y la contraseña.');
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.submitting.set(true);

    this.auth.login(email, password).subscribe({
      next: () => {
        this.submitting.set(false);
        void this.router.navigateByUrl(this.auth.getHomeRoute());
      },
      error: (err: Error) => {
        console.error('Login HTTP error', err);
        this.submitting.set(false);
        this.errorMessage.set(err.message ?? 'No se pudo iniciar sesión.');
      }
    });
  }

  /** Rellena el formulario (cuenta demo). El envío sigue siendo explícito con «Iniciar sesión» o demo+API. */
  fillDemo(email: string, password: string): void {
    this.loginForm.patchValue({ email, password });
  }

  /** Demo sin llamar al servidor (fallback). */
  loginDemoLocal(): void {
    console.log('Intentando login demo local...');
    this.errorMessage.set(null);
    const { email, password } = this.loginForm.getRawValue();
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const ok = this.auth.loginDemo(email, password);
    if (!ok) {
      this.errorMessage.set('Credenciales demo no reconocidas.');
      return;
    }
    void this.router.navigateByUrl(this.auth.getHomeRoute());
  }

  roleLabel(role: SystemRole): string {
    return ROLE_PROFILES[role].label;
  }
}
