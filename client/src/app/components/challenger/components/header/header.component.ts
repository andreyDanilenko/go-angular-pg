import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-challenge-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header>
        <div class="container header-content">
            <div class="logo">ChallengeTracker</div>
            <nav class="nav-links">
                <a routerLink="/">Главная</a>
                <a routerLink="/">Челленджи</a>
                <a routerLink="/">Статистика</a>
                <a routerLink="/">Профиль</a>
                <a routerLink="/">Выход</a>
            </nav>
        </div>
    </header>
  `,
  styles: [`
    header {
      background-color: var(--md-sys-color-surface);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 15px 0;
      position: sticky;
      top: 0;
      z-index: 100;
      transition: background-color 0.3s ease;
    }

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .logo {
        font-size: 24px;
        font-weight: 700;
        color: var(--md-sys-color-primary);
    }

    .nav-links a {
        margin-left: 20px;
        text-decoration: none;
        color: var(--md-sys-color-on-surface);
        font-weight: 500;
        transition: color 0.3s;
    }

    .nav-links a:hover {
        color: var(--md-sys-color-primary);
    }
  `]
})

export class HeaderComponent {}
