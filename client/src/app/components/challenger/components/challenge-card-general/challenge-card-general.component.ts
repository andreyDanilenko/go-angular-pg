import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeGeneral, ChallengeLevel } from '../../types/challengeGeneral';

@Component({
  selector: 'app-challenge-card-general',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="challenge-card"
      [class.featured]="challenge?.isFeatured"
      [class.new]="challenge?.isNew"
      (click)="onCardClick()">

      <img
        [src]="challenge?.image || 'https://placehold.co/300x180/cccccc/666666?text=Челлендж'"
        [alt]="challenge?.title"
        class="challenge-image"
        (error)="onImageError($event)">

      <div class="challenge-info">
        <span class="challenge-category">{{ challenge?.category || 'Челлендж' }}</span>

        <h3 class="challenge-title">{{ challenge?.title || 'Название челленджа' }}</h3>

        <p class="challenge-description">
          {{ challenge?.description || 'Описание челленджа появится скоро...' }}
        </p>

        <div class="challenge-meta">
          <div class="challenge-duration">
            <span>📅</span>
            <span>{{ getDurationText(challenge?.duration) }}</span>
          </div>

          <div class="challenge-level">
            <span
              class="level-badge"
              [class.level-beginner]="challenge?.level === 'beginner'"
              [class.level-intermediate]="challenge?.level === 'intermediate'"
              [class.level-advanced]="challenge?.level === 'advanced'">
              {{ getLevelText(challenge?.level) }}
            </span>
          </div>
        </div>

        <div class="participants">
          <span>👥</span>
          <span>{{ getParticipantsText(challenge?.participants) }}</span>
        </div>
      </div>

      <!-- Бейджи -->
       @if (challenge?.isFeatured || challenge?.isNew) {
        <div class="badges">
          @if (challenge?.isFeatured) { <span class="badge featured">🔥 Популярный</span> }
          @if (challenge?.isNew) { <span class="badge new">🆕 Новый</span> }
        </div>
       }
    </div>
  `,
  styles: [`
    .challenge-card {
        background-color: var(--md-sys-color-surface);
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        transition: transform 0.3s, box-shadow 0.3s;
        cursor: pointer;
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .challenge-card.featured {
        border: 2px solid var(--md-sys-color-primary);
    }

    .challenge-card.new {
        border: 2px solid var(--md-sys-color-secondary);
    }

    .challenge-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
    }

    .challenge-image {
        width: 100%;
        height: 180px;
        object-fit: cover;
        flex-shrink: 0;
    }

    .challenge-info {
        flex-grow: 1;
        height: 100%;
        padding: 20px;
        display: flex;
        flex-direction: column;
    }

    .challenge-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 10px;
        color: var(--md-sys-color-on-surface);
    }

    .challenge-category {
        width: fit-content;
        display: inline-block;
        padding: 4px 10px;
        border-radius: 15px;
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 10px;
        background-color: var(--md-sys-color-surface-variant);
        color: var(--md-sys-color-on-surface-variant);
    }

    .challenge-description {
        font-size: 14px;
        color: var(--md-sys-color-on-surface-variant);
        margin-bottom: 15px;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        flex: 1;
    }

    .challenge-meta {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: var(--md-sys-color-on-surface-variant);
    }

    .challenge-duration {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .challenge-level {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .level-badge {
        width: fit-content;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 500;
    }

    .level-beginner {
        background-color: var(--md-sys-color-secondary-container);
        color: var(--md-sys-color-on-secondary-container);
    }

    .level-intermediate {
        background-color: var(--md-sys-color-tertiary-container);
        color: var(--md-sys-color-on-tertiary-container);
    }

    .level-advanced {
        background-color: var(--md-sys-color-error-container);
        color: var(--md-sys-color-on-error-container);
    }

    .participants {
        display: flex;
        align-items: center;
        gap: 5px;
        color: var(--md-sys-color-on-surface-variant);
    }

    .badges {
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .badge {
        padding: 4px 8px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 600;
    }

    .badge.featured {
        background-color: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
    }

    .badge.new {
        background-color: var(--md-sys-color-secondary);
        color: var(--md-sys-color-on-secondary);
    }

    @media (max-width: 768px) {
      .challenge-meta {
          flex-direction: column;
          gap: 5px;
      }
    }
  `]
})
export class ChallengeCardGeneralComponent {
  @Input() challenge: ChallengeGeneral | null = null;
  @Output() cardClick = new EventEmitter<string>();
  @Output() imageError = new EventEmitter<string>();

  getDurationText(duration?: number): string {
    if (!duration) return 'Длительность не указана';

    if (duration < 30) {
      return `${duration} дней`;
    } else if (duration === 30) {
      return '30 дней';
    } else {
      const weeks = Math.ceil(duration / 7);
      return `${weeks} недель`;
    }
  }

  getLevelText(level?: ChallengeLevel): string {
    switch (level) {
      case 'beginner': return 'Начинающий';
      case 'intermediate': return 'Средний';
      case 'advanced': return 'Продвинутый';
      default: return 'Уровень не указан';
    }
  }

  getParticipantsText(participants?: number): string {
    if (!participants) return 'Участники не указаны';

    if (participants >= 1000) {
      return `${(participants / 1000).toFixed(1)}k участников`;
    } else {
      return `${participants} участников`;
    }
  }

  onCardClick(): void {
    if (this.challenge?.id) {
      this.cardClick.emit(this.challenge.id);
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placehold.co/300x180/cccccc/666666?text=Изображение+не+загружено';

    if (this.challenge?.id) {
      this.imageError.emit(`Image failed to load for challenge ${this.challenge.id}`);
    }
  }
}
