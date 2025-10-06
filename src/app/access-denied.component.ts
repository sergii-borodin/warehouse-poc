import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="access-denied-page">
      <div class="access-denied-content">
        <div class="icon">🚫</div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <p>Please contact your administrator if you believe this is an error.</p>
        <div class="actions">
          <button routerLink="/login" class="btn-primary">Go to Login</button>
          <button routerLink="/storage" class="btn-secondary">Go to Storage</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .access-denied-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f8fafc;
        padding: 2rem;
      }
      .access-denied-content {
        text-align: center;
        max-width: 500px;
        background: white;
        padding: 3rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }
      h1 {
        color: #dc2626;
        margin-bottom: 1rem;
        font-size: 2rem;
      }
      p {
        color: #6b7280;
        margin-bottom: 1rem;
        line-height: 1.6;
      }
      .actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
      }
      .btn-primary {
        background-color: #0b63d1;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        text-decoration: none;
        font-size: 1rem;
        transition: background-color 0.2s;
      }
      .btn-primary:hover {
        background-color: #1d4ed8;
      }
      .btn-secondary {
        background-color: #6b7280;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        text-decoration: none;
        font-size: 1rem;
        transition: background-color 0.2s;
      }
      .btn-secondary:hover {
        background-color: #4b5563;
      }
    `,
  ],
})
export class AccessDeniedComponent {}
