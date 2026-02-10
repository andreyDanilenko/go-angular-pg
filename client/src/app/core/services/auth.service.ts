import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private authState = new BehaviorSubject<boolean>(this.isLoggedIn());

  constructor(private http: HttpClient) {}

  get authState$(): Observable<boolean> {
    return this.authState.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return now >= payload.exp;
    } catch {
      return true;
    }
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.authState.next(true);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.authState.next(false);
  }
}
