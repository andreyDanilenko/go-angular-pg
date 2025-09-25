import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeDetailCatalogInfo } from '../../../types/сhallengeCatalogDetail';

@Component({
  selector: 'app-challenge-detail-catalog-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sidebar-card">
      <h3 class="sidebar-title">{{ data?.title || 'Информация о челлендже' }}</h3>

      @if (data?.stats) {
        <div class="stats-grid">
          @for (stat of data!.stats; track stat.type) {
            <div class="stat-item">
              @if (stat.icon) {
                <div class="stat-icon">{{ stat.icon }}</div>
              }
              <div class="stat-number">{{ stat.value }}{{ stat.unit }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          }
        </div>
      }

      @if (data?.difficulty) {
        <div class="difficulty-badge difficulty-{{ data!.difficulty.level }}">
          Уровень: {{ data!.difficulty.label }}
        </div>
        @if (data!.difficulty.description) {
          <p class="difficulty-description">{{ data!.difficulty.description }}</p>
        }
      }

      @if (data?.progress) {
        <div class="progress-info">
          <div class="progress-label">
            <span>{{ data!.progress!.label }}</span>
            <span>{{ data!.progress!.percentage }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="data!.progress!.percentage"></div>
          </div>
          <div class="progress-details">
            {{ data!.progress!.current }} из {{ data!.progress!.total }} дней
          </div>
        </div>
      }

      @if (data?.participantsInfo) {
        <div class="participants-info">
          <span>👥</span>
          <span>{{ data!.participantsInfo }}</span>
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
    }

    .sidebar-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      color: var(--md-sys-color-on-surface);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }

    .stat-item {
      text-align: center;
      padding: 15px;
      border-radius: 12px;
      background-color: var(--md-sys-color-surface-variant);
    }

    .stat-icon {
      font-size: 20px;
      margin-bottom: 8px;
    }

    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: var(--md-sys-color-primary);
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 13px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .difficulty-badge {
      display: inline-block;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .difficulty-beginner {
      background-color: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
    }

    .difficulty-intermediate {
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }

    .difficulty-advanced {
      background-color: var(--md-sys-color-tertiary-container);
      color: var(--md-sys-color-on-tertiary-container);
    }

    .difficulty-expert {
      background-color: var(--md-sys-color-error-container);
      color: var(--md-sys-color-on-error-container);
    }

    .difficulty-description {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
      margin: 0 0 20px 0;
    }

    .progress-info {
      margin-top: 20px;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
    }

    .progress-bar {
      height: 8px;
      background-color: var(--md-sys-color-outline-variant);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background-color: var(--md-sys-color-primary);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .progress-details {
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant);
      margin-top: 5px;
      text-align: center;
    }

    .participants-info {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 15px;
      padding: 12px;
      background-color: var(--md-sys-color-surface-variant);
      border-radius: 8px;
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
    }
  `]
})
export class ChallengeDetailCatalogInfoComponent {
  @Input() data: ChallengeDetailCatalogInfo | null = null;
}
