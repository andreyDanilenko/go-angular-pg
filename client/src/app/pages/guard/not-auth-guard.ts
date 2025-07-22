import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class NoAuthGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(): Observable<boolean> {
    if (!this.auth.isLoggedIn()) {
      return of(true); // пользователь не авторизован — пускаем
    }

    this.router.navigate(['/']); // пользователь авторизован — редирект на главную
    return of(false);
  }
}
