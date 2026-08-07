import { Injectable, signal } from '@angular/core';

const TOKEN_STORAGE_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticated = signal(this.hasValidToken());

  readonly isAuthenticated = this.authenticated.asReadonly();

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    this.authenticated.set(true);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    this.authenticated.set(false);
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const [, encodedPayload] = token.split('.');
      if (!encodedPayload) {
        return false;
      }

      const payload = JSON.parse(atob(encodedPayload)) as { exp?: number };
      return typeof payload.exp === 'number' && payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }
}
