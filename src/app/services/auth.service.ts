import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export enum UserRole {
  ADMIN = 'admin',
  LIMITED = 'limited',
}

export interface User {
  username: string;
  password: string;
  role: UserRole;
}

interface Credentials {
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'auth_user';

  private users: User[] = [
    { username: 'claus', password: 'test', role: UserRole.ADMIN },
    { username: 'michael', password: 'test', role: UserRole.ADMIN },
    { username: 'peter', password: 'test', role: UserRole.ADMIN },
    { username: 'mikkel', password: 'test', role: UserRole.LIMITED },
  ];

  constructor(private router: Router) {}

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.storageKey);
  }

  getCurrentUser(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  getCurrentUserRole(): UserRole | null {
    const username = this.getCurrentUser();
    if (!username) return null;
    const user = this.users.find((u) => u.username === username);
    return user ? user.role : null;
  }

  hasRole(requiredRole: UserRole): boolean {
    const currentRole = this.getCurrentUserRole();
    if (!currentRole) return false;

    // Admin has access to everything
    if (currentRole === UserRole.ADMIN) return true;

    // Check if user has the required role
    return currentRole === requiredRole;
  }

  canAccessRoute(route: string): boolean {
    const currentRole = this.getCurrentUserRole();
    if (!currentRole) return false;

    // Admin has access to all routes
    if (currentRole === UserRole.ADMIN) return true;

    // Limited users can only access /storage route
    if (currentRole === UserRole.LIMITED) {
      return route === '/storage' || route.startsWith('/storage/');
    }

    return false;
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
