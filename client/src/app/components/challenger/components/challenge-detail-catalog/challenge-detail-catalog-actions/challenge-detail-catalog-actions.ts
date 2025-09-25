import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChallengeActionsData } from '../../../types/сhallengeCatalogDetail';

@Component({
  selector: 'app-challenge-detail-catalog-actions',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="sidebar-card">
      <h3 class="sidebar-title">{{ getTitle() }}</h3>

      <div class="action-buttons">
        <!-- Кнопка участия -->
        @if (actionsData.canJoin && !actionsData.isParticipating) {
          <button
            class="btn btn-primary"
            (click)="onJoinChallenge()"
            [disabled]="isLoading">
            {{ getJoinButtonText() }}
          </button>
        }

        <!-- Кнопка для участника -->
        @if (actionsData.isParticipating) {
          <button
            class="btn btn-success"
            [routerLink]="['/challenge', actionsData.challengeId, 'tracker']">
            📊 Перейти к трекеру
          </button>
        }

        <!-- Кнопка закладки -->
        <button
          class="btn btn-outline"
          (click)="onToggleBookmark()"
          [class.bookmarked]="actionsData.isBookmarked"
          [disabled]="isLoading">
          {{ actionsData.isBookmarked ? '★ В закладках' : '☆ Добавить в закладки' }}
        </button>

        <!-- Дополнительные действия для участника -->
        @if (actionsData.isParticipating) {
          <button
            class="btn btn-warning"
            (click)="onLeaveChallenge()">
            Покинуть челлендж
          </button>
        }
      </div>

      <!-- Информация о статусе -->
      @if (actionsData.joinDate) {
        <div class="join-info">
          <span>Вы присоединились: {{ actionsData.joinDate | date:'dd.MM.yyyy' }}</span>
        </div>
      }

      <!-- Лоадер -->
      @if (isLoading) {
        <div class="loading-overlay">
          <div class="spinner"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .sidebar-card {
      background-color: var(--md-sys-color-surface);
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
      position: relative;
    }

    .sidebar-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      color: var(--md-sys-color-on-surface);
      text-align: center;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .btn {
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      text-decoration: none;
      display: block;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
    }

    .btn-primary:hover:not(:disabled) {
      background-color: var(--md-sys-color-primary-dark);
      transform: translateY(-1px);
    }

    .btn-success {
      background-color: var(--md-sys-color-secondary);
      color: var(--md-sys-color-on-secondary);
    }

    .btn-outline {
      background-color: transparent;
      border: 2px solid var(--md-sys-color-outline);
      color: var(--md-sys-color-on-surface);
    }

    .btn-outline.bookmarked {
      border-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-primary);
    }

    .btn-outline:hover:not(:disabled) {
      border-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-primary);
    }

    .btn-warning {
      background-color: transparent;
      border: 2px solid var(--md-sys-color-error);
      color: var(--md-sys-color-error);
    }

    .btn-warning:hover:not(:disabled) {
      background-color: var(--md-sys-color-error);
      color: white;
    }

    .join-info {
      margin-top: 15px;
      padding: 10px;
      background-color: var(--md-sys-color-surface-variant);
      border-radius: 6px;
      text-align: center;
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 15px;
    }

    .spinner {
      width: 30px;
      height: 30px;
      border: 3px solid var(--md-sys-color-outline);
      border-top: 3px solid var(--md-sys-color-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Адаптивность */
    @media (max-width: 768px) {
      .sidebar-card {
        padding: 20px;
      }

      .btn {
        padding: 10px 16px;
        font-size: 13px;
      }
    }
  `]
})
export class ChallengeDetailCatalogActionsComponent {
  @Input() actionsData!: ChallengeActionsData;
  @Input() isLoading: boolean = false;

  @Output() joinChallenge = new EventEmitter<string>();
  @Output() toggleBookmark = new EventEmitter<{ challengeId: string, isBookmarked: boolean }>();
  @Output() leaveChallenge = new EventEmitter<string>();

  getTitle(): string {
    if (this.actionsData.isParticipating) {
      return 'Ваше участие';
    }
    return 'Присоединиться к челленджу';
  }

  getJoinButtonText(): string {
    switch (this.actionsData.challengeStatus) {
      case 'upcoming':
        return '📅 Записаться';
      case 'active':
        return '🚀 Начать участие';
      case 'completed':
        return '👀 Посмотреть результаты';
      default:
        return 'Присоединиться';
    }
  }

  onJoinChallenge(): void {
    if (!this.isLoading) {
      this.joinChallenge.emit(this.actionsData.challengeId);
    }
  }

  onToggleBookmark(): void {
    if (!this.isLoading) {
      this.toggleBookmark.emit({
        challengeId: this.actionsData.challengeId,
        isBookmarked: !this.actionsData.isBookmarked
      });
    }
  }

  onLeaveChallenge(): void {
    if (!this.isLoading && confirm('Вы уверены, что хотите покинуть челлендж?')) {
      this.leaveChallenge.emit(this.actionsData.challengeId);
    }
  }
}
