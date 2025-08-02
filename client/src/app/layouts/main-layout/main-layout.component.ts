import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../components/shared/header/header.component';
import { UserService } from '../../core/services/user.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  isLoading = true;
  error: string | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
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
