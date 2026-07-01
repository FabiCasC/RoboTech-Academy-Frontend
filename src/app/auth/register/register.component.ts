import { Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
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
import { environment } from '../../../environments/environment';

/** En el control «confirmar» para que mat-error lo detecte (no en el grupo). */
function confirmMatchesPassword(): ValidatorFn {
  return (control): ValidationErrors | null => {
    const confirm = control.value as string;
    const parent = control.parent;
    if (!parent) return null;
    const password = parent.get('password')?.value as string | undefined;
    if (password === undefined || confirm === undefined) return null;
    if (confirm.length === 0) return null;
    return password === confirm ? null : { mismatch: true };
  };
}

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly apiBaseUrl = environment.apiUrl;

  readonly registerForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, confirmMatchesPassword()]]
  });

  constructor() {
    this.registerForm.controls.password.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.registerForm.controls.confirmPassword.updateValueAndValidity({
          emitEvent: false
        });
      });
  }

  onRegister(): void {
    console.log('Intentando registro en API...');
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage.set(this.describeRegisterBlockingErrors());
      return;
    }

    const { email, password } = this.registerForm.getRawValue();
    this.submitting.set(true);

    this.auth.register({ email, password }).subscribe({
      next: () => {
        this.submitting.set(false);
        if (this.auth.isAuthenticated()) {
          void this.router.navigateByUrl(this.auth.getHomeRoute());
          return;
        }
        this.successMessage.set('Cuenta creada. Inicia sesión con tu correo.');
        void this.router.navigate(['/login'], {
          queryParams: { registered: '1', email }
        });
      },
      error: (err: Error) => {
        console.error('Register HTTP error', err);
        this.submitting.set(false);
        this.errorMessage.set(err.message ?? 'No se pudo registrar.');
      }
    });
  }

  private describeRegisterBlockingErrors(): string {
    const parts: string[] = [];
    const e = this.registerForm.controls.email;
    const p = this.registerForm.controls.password;
    const c = this.registerForm.controls.confirmPassword;

    if (e.hasError('required')) parts.push('indica el correo');
    if (e.hasError('email')) parts.push('correo no válido (ej. usuario@dominio.com)');
    if (p.hasError('required')) parts.push('indica la contraseña');
    if (p.hasError('minlength')) parts.push('contraseña: mínimo 6 caracteres');
    if (c.hasError('required')) parts.push('confirma la contraseña');
    if (c.hasError('mismatch')) parts.push('las contraseñas no coinciden');

    if (parts.length === 0) {
      return 'Revisa los campos resaltados.';
    }
    return `No se envió al servidor: ${parts.join('; ')}.`;
  }
}
