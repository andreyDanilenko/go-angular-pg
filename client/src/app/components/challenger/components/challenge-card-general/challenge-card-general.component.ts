import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeGeneral, ChallengeLevel } from '../../types/challengeGeneral';

@Component({
  selector: 'app-challenge-card-general',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="challenge-card"
      [attr.data-featured]="challenge?.isFeatured ? true : null"
      [attr.data-new]="challenge?.isNew ? true : null"
      [attr.data-level]="challenge?.level || null"
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
            <span class="level-badge">{{ getLevelText(challenge?.level) }}</span>
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
          @if (challenge?.isFeatured) { <span class="badge badge--featured">🔥 Популярный</span> }
          @if (challenge?.isNew) { <span class="badge badge--new">🆕 Новый</span> }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      /* Scalable, theme-friendly tokens (override per host if needed) */
      --card-radius: 15px;
      --card-padding: 20px;
      --card-image-height: 180px;
      --elevation-rest: 0 5px 15px rgba(0, 0, 0, 0.08);
      --elevation-hover: 0 10px 25px rgba(0, 0, 0, 0.12);
      --gap-xs: 5px;
      --gap-sm: 10px;
    }

    .challenge-card {
      background-color: var(--md-sys-color-surface);
      border-radius: var(--card-radius);
      overflow: hidden;
      box-shadow: var(--elevation-rest);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      border: 2px solid transparent;
    }

    .challenge-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--elevation-hover);
    }

    /* Featured/New state via attributes for scalability */
    .challenge-card[data-featured] {
      border-color: var(--md-sys-color-primary);
    }
    .challenge-card[data-new] {
      border-color: var(--md-sys-color-secondary);
    }

    .challenge-image {
      width: 100%;
      height: var(--card-image-height);
      object-fit: cover;
      flex-shrink: 0;
    }

    .challenge-info {
      flex-grow: 1;
      height: 100%;
      padding: var(--card-padding);
      display: flex;
      flex-direction: column;
      gap: var(--gap-sm);
    }

    .challenge-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 var(--gap-sm) 0;
      color: var(--md-sys-color-on-surface);
    }

    .challenge-category {
      width: fit-content;
      display: inline-block;
      padding: 4px 10px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: 500;
      margin: 0 0 var(--gap-sm) 0;
      background-color: var(--md-sys-color-surface-variant);
      color: var(--md-sys-color-on-surface-variant);
    }

    .challenge-description {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
      margin: 0 0 15px 0;
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
      gap: var(--gap-sm);
    }

    .challenge-duration,
    .challenge-level {
      display: flex;
      align-items: center;
      gap: var(--gap-xs);
    }

    .level-badge {
      width: fit-content;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 500;
      background-color: var(--level-bg, var(--md-sys-color-surface-variant));
      color: var(--level-fg, var(--md-sys-color-on-surface-variant));
    }

    /* Map levels using data attribute for easier extension */
    .challenge-card[data-level="beginner"] .level-badge {
      --level-bg: var(--md-sys-color-secondary-container);
      --level-fg: var(--md-sys-color-on-secondary-container);
    }
    .challenge-card[data-level="intermediate"] .level-badge {
      --level-bg: var(--md-sys-color-tertiary-container);
      --level-fg: var(--md-sys-color-on-tertiary-container);
    }
    .challenge-card[data-level="advanced"] .level-badge {
      --level-bg: var(--md-sys-color-error-container);
      --level-fg: var(--md-sys-color-on-error-container);
    }

    .participants {
      display: flex;
      align-items: center;
      gap: var(--gap-xs);
      color: var(--md-sys-color-on-surface-variant);
    }

    .badges {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      flex-direction: column;
      gap: var(--gap-xs);
    }

    .badge {
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 600;
      color: var(--badge-fg);
      background-color: var(--badge-bg);
    }
    .badge--featured {
      --badge-bg: var(--md-sys-color-primary);
      --badge-fg: var(--md-sys-color-on-primary);
    }
    .badge--new {
      --badge-bg: var(--md-sys-color-secondary);
      --badge-fg: var(--md-sys-color-on-secondary);
    }

    @media (max-width: 768px) {
      .challenge-meta {
        flex-direction: column;
        gap: var(--gap-xs);
      }
    }
  `]
})
export class ChallengeCardGeneralComponent {
  @Input() challenge: ChallengeGeneral | null = null;
  @Output() cardClick = new EventEmitter<string>();
  @Output() imageError = new EventEmitter<string>();
  readonly fallbackImage = 'https://placehold.co/300x180/cccccc/666666?text=Челлендж';
  readonly errorImage = 'https://placehold.co/300x180/cccccc/666666?text=Изображение+не+загружено';

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
    img.src = this.errorImage;

    if (this.challenge?.id) {
      this.imageError.emit(`Image failed to load for challenge ${this.challenge.id}`);
    }
  }
}
