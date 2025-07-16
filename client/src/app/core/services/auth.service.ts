import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';

  // Проверка, есть ли токен в localStorage (примитивно — можно усложнить)
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  // Сохраняем токен после успешного входа или регистрации
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Получить токен (например, для отправки в заголовках)
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Очистить токен при выходе из системы
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
