import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from './core/services/user.service';
import { catchError, of, Subject, takeUntil, tap } from 'rxjs';
import { WebSocketService } from './core/services/web-socket-service.service';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';


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
    private authService: AuthService,
    public themeService: ThemeService
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

  private initUserSession(): void {
    this.loadUserData().pipe(
      tap(() => {
        const token = this.authService.getToken();
        if (token) {
          this.wsService.updateToken(token);
          this.wsService.connect();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private loadUserData() {
    return this.userService.getUserMe().pipe(
      catchError(err => {
        console.error('Error loading user data:', err);
        this.cleanUserSession();
        return of(null);
      })
    );
  }

  private cleanUserSession(): void {
    this.wsService.disconnect();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
