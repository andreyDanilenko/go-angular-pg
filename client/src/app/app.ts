import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from './core/services/user.service';
import { catchError, of } from 'rxjs';
import { WebSocketService } from './core/services/web-socket-service.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: `:host { display: block; height: 100%; }`
})
export class App implements OnInit {
  protected readonly title = signal('client');
  isLoading = true;
  error: string | null = null;

  constructor(private userService: UserService, private wsService: WebSocketService) {}

  ngOnInit(): void {
    this.wsService.connect();
    this.loadUserData();
  }

  private loadUserData(): void {
    this.isLoading = true;
    this.error = null;

    this.userService.getUserMe().pipe(
      catchError((err) => {
        this.error = 'Failed to load user data';
        console.error('Error loading user data:', err);
        return of(null);
      })
    ).subscribe({
      next: (userData) => {
        // Здесь можно обработать полученные данные пользователя
        // Например, сохранить их в сервисе или в локальном состоянии
        console.log('User data loaded:', userData);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

}
