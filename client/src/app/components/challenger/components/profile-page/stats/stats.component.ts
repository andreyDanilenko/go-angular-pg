import { Component, Input } from '@angular/core';
import type { ChallengeProfileStats } from '../../../types/stats';

@Component({
  selector: 'app-challenge-profile-stats',
  standalone: true,
  imports: [],
  template: `
    <div class="stats-container">
      <div class="stat-item">
        <div class="stat-number">{{ stats?.completed ?? 0 }}</div>
        <div class="stat-label">Завершенных челленджей</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ stats?.active ?? 0 }}</div>
        <div class="stat-label">Активных челленджей</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ stats?.success ?? 0 }}%</div>
        <div class="stat-label">Успеваемость</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ stats?.streak ?? 0 }}</div>
        <div class="stat-label">Дней подряд</div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      width: 100%;
    }
    .stats-container {
        display: flex;
        justify-content: space-around;
        width: 100%;
        margin-bottom: 40px;
        flex-wrap: wrap;
    }

    .stat-item {
        text-align: center;
        padding: 20px;
        border-radius: 12px;
        background-color: var(--md-sys-color-surface-variant);
        min-width: 150px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
        transition: background-color 0.3s ease;
    }

    .stat-number {
        font-size: 28px;
        font-weight: 700;
        color: var(--md-sys-color-primary);
        margin-bottom: 5px;
    }

    .stat-label {
        font-size: 14px;
        color: var(--md-sys-color-on-surface-variant);
    }

    @media (max-width: 768px) {
      .stats-container {
          flex-direction: column;
          align-items: center;
      }

      .stat-item {
          margin-bottom: 15px;
          min-width: 100%;
      }
    }
  `]
})

export class ChallengeProfileStatsComponent {
  @Input() stats: ChallengeProfileStats | null = null;
}
