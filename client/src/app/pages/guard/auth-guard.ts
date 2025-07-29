import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Кэшируем запрос пользователя
  private userRequest$: Observable<boolean> | null = null;

  canActivate(): Observable<boolean> {
    // Проверяем наличие токена
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return of(false);
    }

    // Если запрос уже был - возвращаем кэшированный
    if (!this.userRequest$) {
      this.userRequest$ = this.userService.getUserMe().pipe(
        map(() => true),
        catchError(() => {
          this.authService.logout();
          this.router.navigate(['/auth/login']);
          return of(false);
        }),
        shareReplay(1) // Кэшируем результат
      );
    }

    return this.userRequest$;
  }
}
