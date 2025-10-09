import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { User, UserRole, LoginCredentials, AuthResponse, AuthState } from '../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'auth_user';
  private readonly authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    currentUser: null,
    token: null,
  });

  public authState$ = this.authStateSubject.asObservable();

  private users: User[] = [
    {
      id: '1',
      username: 'claus',
      password: 'test',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      username: 'michael',
      password: 'test',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      username: 'peter',
      password: 'test',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      username: 'mikkel',
      password: 'test',
      role: UserRole.LIMITED,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '5',
      username: 'tomas',
      password: 'test',
      role: UserRole.LIMITED,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '6',
      username: 'daniel',
      password: 'test',
      role: UserRole.LIMITED,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '7',
      username: 'henrik',
      password: 'test',
      role: UserRole.LIMITED,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  constructor(private router: Router) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const storedUser = localStorage.getItem(this.storageKey);
    if (storedUser) {
      const user = this.users.find((u) => u.username === storedUser);
      if (user) {
        this.authStateSubject.next({
          isAuthenticated: true,
          currentUser: user,
          token: this.generateToken(user),
        });
      }
    }
  }

  private generateToken(user: User): string {
    // Simple token generation - in real app, this would be done by the server
    return btoa(`${user.id}:${user.username}:${Date.now()}`);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.authStateSubject.value.currentUser;
  }

  /**
   * Get current user as string (backward compatibility)
   * @deprecated Use getCurrentUser() instead
   */
  getCurrentUserString(): string | null {
    const user = this.getCurrentUser();
    return user ? user.username : null;
  }

  /**
   * Get all users
   */
  getAllUsers(): Observable<User[]> {
    return of(this.users.filter((user) => user.isActive !== false));
  }

  /**
   * Get current user role
   */
  getCurrentUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  /**
   * Check if current user has required role
   */
  hasRole(requiredRole: UserRole): boolean {
    const currentRole = this.getCurrentUserRole();
    if (!currentRole) return false;

    // Admin has access to everything
    if (currentRole === UserRole.ADMIN) return true;

    // Check if user has the required role
    return currentRole === requiredRole;
  }

  /**
   * Check if current user can access a specific route
   */
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

  /**
   * Login with credentials
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    const matched = this.users.find(
      (u) =>
        u.username.toLowerCase() === credentials.username.toLowerCase() &&
        u.password === credentials.password &&
        u.isActive !== false
    );

    if (matched) {
      const token = this.generateToken(matched);
      localStorage.setItem(this.storageKey, matched.username);

      const authState: AuthState = {
        isAuthenticated: true,
        currentUser: matched,
        token: token,
      };

      this.authStateSubject.next(authState);

      return of({
        success: true,
        user: matched,
        token: token,
      });
    }

    return of({
      success: false,
      error: 'Invalid credentials',
    });
  }

  /**
   * Login with username and password (backward compatibility)
   * @deprecated Use login() with LoginCredentials instead
   */
  loginLegacy(username: string, password: string): boolean {
    const credentials: LoginCredentials = { username, password };
    let success = false;

    this.login(credentials).subscribe((response) => {
      success = response.success;
    });

    return success;
  }

  /**
   * Logout current user
   */
  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.authStateSubject.next({
      isAuthenticated: false,
      currentUser: null,
      token: null,
    });
    this.router.navigate(['/login']);
  }

  /**
   * Get authentication state as observable
   */
  getAuthState(): Observable<AuthState> {
    return this.authState$;
  }

  /**
   * Validate token (placeholder for future implementation)
   */
  validateToken(token: string): Observable<boolean> {
    // In a real application, this would validate the token with the server
    return of(!!token);
  }
}
