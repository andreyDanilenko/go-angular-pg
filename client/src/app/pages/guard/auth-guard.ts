import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private userService = inject(UserService);
    private authService = inject(AuthService);

  private router = inject(Router);

  canActivate(): Observable<boolean> {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return of(false);
    }

    return this.userService.getUserMe().pipe(
      map(() => true),
      catchError(() => {
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}
