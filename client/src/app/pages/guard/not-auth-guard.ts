import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Injectable({ providedIn: 'root' })
export class NoAuthGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    if (!this.auth.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/']);
    return false;
  }
}
