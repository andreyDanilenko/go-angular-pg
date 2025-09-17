import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ProfileChallengeInfo } from '../../types/profileChallengeInfo';

@Component({
  selector: 'app-challenge-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="challenge-card">
      <img
        [src]="challenge.image"
        [alt]="challenge.title"
        loading="eager"
        class="challenge-image">

      <div class="challenge-info">
        <h3 class="challenge-title">{{ challenge.title }}</h3>

        <span
          class="challenge-status"
          [class.status-completed]="challenge.status === 'completed'"
          [class.status-active]="challenge.status === 'active'"
          [class.status-upcoming]="challenge.status === 'planned'">
          {{ getStatusText(challenge.status) }}
        </span>

        <div class="challenge-progress">
          <div
            class="challenge-progress-bar"
            [style.width.%]="challenge.progress">
          </div>
        </div>

        <div class="challenge-meta">
          <span>Начал: {{ challenge.startDate }}</span>
          @if (challenge.status === 'completed') {
            <span>
              Завершен: {{ challenge.endDate }}
            </span>
          }
          @if (challenge.status !== 'completed') {
            <span>
              Завершит: {{ challenge.endDate }}
            </span>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .challenge-card {
      border-radius: 12px;
      overflow: hidden;
      background: var(--md-sys-color-surface);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .challenge-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .challenge-image {
      width: 100%;
      height: 180px;
      object-fit: cover;
    }

    .challenge-info {
      padding: 16px;
    }

    .challenge-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--md-sys-color-on-surface);
    }

    .challenge-status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      margin-bottom: 16px;
    }

    .status-completed {
        background-color: var(--md-sys-color-secondary-container);
        color: var(--md-sys-color-on-secondary-container);
    }

    .status-active {
        background-color: var(--md-sys-color-primary-container);
        color: var(--md-sys-color-on-primary-container);
    }

    .status-upcoming {
        background-color: var(--md-sys-color-tertiary-container);
        color: var(--md-sys-color-on-tertiary-container);
    }

    .challenge-progress {
      height: 8px;
      background-color: var(--md-sys-color-surface-variant);
      border-radius: 4px;
      margin-bottom: 16px;
      overflow: hidden;
    }

    .challenge-progress-bar {
      height: 100%;
      background-color: var(--md-sys-color-primary);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .challenge-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant);
    }
  `]
})
export class ChallengeCardComponent {
  @Input({ required: true }) challenge!: ProfileChallengeInfo;

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Завершен';
      case 'active': return 'Активный';
      case 'planned': return 'Запланирован';
      default: return status;
    }
  }
}
