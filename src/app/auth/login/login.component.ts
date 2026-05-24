import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  readonly temporaryAdmin;

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  constructor() {
    this.temporaryAdmin = this.authService.getTemporaryAdminCredentials();
  }

  onSubmit(): void {
    this.errorMessage = '';

    const isValid = this.authService.login(this.email, this.password);

    if (!isValid) {
      this.errorMessage = 'Credenciales invalidas. Usa el admin temporal mostrado abajo.';
      return;
    }

    void this.router.navigate(['/dashboard']);
  }
}
