import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { DatePipe } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
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
    private authService: AuthService,
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

  getDefaultBio(): string {
    return `Даниленко Андрей Георгиевич
Fullstack-разработчик с опытом DevOps

Контакты:
Email: danilenko.a.g@mail.ru
Telegram: @danilllenko
GitHub: github.com/andreyDanilenko

Ключевые навыки:
Frontend: Vue.js (Nuxt 2/3), React (Next.js), Angular, TypeScript
Backend: Node.js (Express, Nest.js), Go (Gin), REST API
Базы данных: PostgreSQL
DevOps: Docker, Nginx, CI/CD (GitHub Actions), Linux

Опыт: 4+ года в коммерческой разработке (Garwin, buzz.ai, lifedream.tech)

Обо мне: Опытный разработчик, фокусирующийся на качестве архитектуры. Осваиваю новые технологии в пет-проектах (Golang, Svelte).`;
  }

  getAvatarInitials(): string {
    if (!this.user) return '?';
    const f = this.user.first_name?.trim();
    const l = this.user.last_name?.trim();
    if (f && l) return (f[0] + l[0]).toUpperCase();
    if (f) return f[0].toUpperCase();
    if (l) return l[0].toUpperCase();
    if (this.user.username?.trim()) return this.user.username[0].toUpperCase();
    if (this.user.email?.trim()) return this.user.email[0].toUpperCase();
    return '?';
  }

  editProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
