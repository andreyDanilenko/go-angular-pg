import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { SessionService } from '../../core/session/session.service';
import { User } from '../../core/types/user.model';
import { AlertComponent } from '../../shared/ui/alert/alert.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe, AlertComponent, ButtonComponent, SpinnerComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent {
  private readonly session = inject(SessionService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.session.user;
  readonly isLoading = this.session.isLoading;

  avatarInitials(user: User): string {
    const values = [user.firstName, user.lastName].filter(Boolean);
    const initials = values.map((value) => value[0]).join('');
    return (initials || user.username[0] || user.email[0] || '?').toUpperCase();
  }

  edit(): void {
    void this.router.navigate(['/profile/edit']);
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/auth/login']);
  }
}
