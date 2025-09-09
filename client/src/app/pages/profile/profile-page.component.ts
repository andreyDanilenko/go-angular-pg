import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { DatePipe } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/types/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss'],
  providers: [DatePipe]
})
export class ProfilePageComponent implements OnInit {
  user: User | null = null;
  loading = true;

  constructor(
    private userService: UserService,
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.userService.getUserMe().subscribe({
      next: (user) => {
        this.user = user;
        console.log(user);

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.loading = false;
      }
    });
  }

  formatDate(date: Date | string): string {
    return this.datePipe.transform(date, 'dd.MM.yyyy') || '';
  }

  editProfile(): void {
    this.router.navigate(['/profile/edit']);
  }
}
