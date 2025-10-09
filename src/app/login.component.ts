import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { UserRole, LoginCredentials } from './shared/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <h2>Login</h2>
      <form (ngSubmit)="submit()">
        <label>
          Username
          <input [(ngModel)]="username" name="username" />
        </label>
        <label>
          Password
          <input [(ngModel)]="password" name="password" type="password" />
        </label>
        <div class="actions">
          <button type="submit">Login</button>
        </div>
        <div class="error" *ngIf="error">Invalid credentials</div>
      </form>
    </div>
  `,
  styles: [
    `
      .login-page {
        padding: 2rem;
        max-width: 400px;
      }
      form {
        display: grid;
        gap: 0.75rem;
      }
      label {
        display: grid;
        gap: 0.25rem;
      }
      .actions {
        margin-top: 0.5rem;
      }
      .error {
        color: #b00020;
      }
    `,
  ],
})
export class LoginComponent {
  username = '';
  password = '';
  error = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = false;

    const credentials: LoginCredentials = {
      username: this.username,
      password: this.password,
    };

    this.auth.login(credentials).subscribe((response) => {
      if (response.success) {
        // Redirect based on user role
        const userRole = this.auth.getCurrentUserRole();
        if (userRole === UserRole.LIMITED) {
          this.router.navigate(['/storage']);
        } else {
          this.router.navigate(['/search']);
        }
      } else {
        this.error = true;
      }
    });
  }
}
