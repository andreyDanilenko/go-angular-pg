import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ProfileChallengeCardProfile } from '../../types/challengeProfile';

@Component({
  selector: 'app-challenge-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="challenge-card" [attr.data-status]="challenge.status">
      <img
        [src]="challenge.image"
        [alt]="challenge.title"
        loading="eager"
        class="challenge-image">

      <div class="challenge-info">
        <h3 class="challenge-title">{{ challenge.title }}</h3>

        <span class="challenge-status">{{ getStatusText(challenge.status) }}</span>

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
      border-radius: var(--challenge-card-radius, 12px);
      overflow: hidden;
      background: var(--md-sys-color-surface);
      box-shadow: var(--challenge-elevation-rest, 0 4px 12px rgba(0, 0, 0, 0.1));
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .challenge-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--challenge-elevation-hover, 0 8px 24px rgba(0, 0, 0, 0.15));
    }

    .challenge-image {
      width: 100%;
      height: var(--challenge-card-image-height, 180px);
      object-fit: cover;
    }

    .challenge-info {
      padding: var(--challenge-card-padding, 16px);
    }

    .challenge-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--md-sys-color-on-surface);
    }

    /* Remaining styles for progress, status and meta are shared globally */
    .challenge-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant);
    }
  `]
})
export class ChallengeCardComponent {
  @Input({ required: true }) challenge!: ProfileChallengeCardProfile;

  getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Завершен';
      case 'active': return 'Активный';
      case 'planned': return 'Запланирован';
      default: return status;
    }
  }
}
