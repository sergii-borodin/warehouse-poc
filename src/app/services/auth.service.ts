import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

interface Credentials {
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'auth_user';

  private users: Credentials[] = [
    { username: 'claus', password: '123' },
    { username: 'michael', password: '321' },
  ];

  constructor(private router: Router) {}

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.storageKey);
  }

  getCurrentUser(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  login(username: string, password: string): boolean {
    const matched = this.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (matched) {
      localStorage.setItem(this.storageKey, matched.username);
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem(this.storageKey);
    this.router.navigate(['/login']);
  }
}
