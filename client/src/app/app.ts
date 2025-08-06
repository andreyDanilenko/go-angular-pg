import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from './core/services/user.service';
import { catchError, of, Subject, takeUntil } from 'rxjs';
import { WebSocketService } from './core/services/web-socket-service.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: `:host { display: block; height: 100%; }`
})
export class App implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private wsService: WebSocketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkAuthState();
    this.authService.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.checkAuthState());
  }

  private checkAuthState(): void {
    if (this.authService.isLoggedIn()) {
      this.initUserSession();
    } else {
      this.cleanUserSession();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initUserSession(): void {
    this.wsService.connect();
    this.loadUserData();
  }

  private cleanUserSession(): void {
    this.wsService.disconnect();
  }

  private loadUserData(): void {
    this.userService.getUserMe().pipe(
      catchError(err => {
        console.error('Error loading user data:', err);
        return of(null);
      }),
      takeUntil(this.destroy$)
    ).subscribe(userData => {
      console.log('User data loaded:', userData);
    });
  }
}
