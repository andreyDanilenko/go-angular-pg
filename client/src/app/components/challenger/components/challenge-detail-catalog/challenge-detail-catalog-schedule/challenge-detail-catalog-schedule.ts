import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeDetailCatalogSchedule, DifficultyStyle } from '../../../types/сhallengeCatalogDetail';

@Component({
  selector: 'app-challenge-detail-catalog-schedule',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="schedule-section">
      <h2 class="section-title">Расписание тренировок</h2>

      @if (data?.weeks && data!.weeks.length > 0) {
        <!-- Десктопная таблица -->
        <table class="workout-table desktop-table">
          <thead>
            <tr>
              <th>Неделя</th>
              <th>Тип тренировки</th>
              <th>Основные упражнения</th>
              <th>Уровень сложности</th>
              <th>Прогрессия нагрузки</th>
            </tr>
          </thead>
          <tbody>
            @for (week of data!.weeks; track week.weekNumber) {
              <tr>
                <td>
                  <strong>{{ week.title }}</strong>
                  <br>
                  <em>{{ week.subtitle }}</em>
                </td>
                <td>{{ week.workoutType }}</td>
                <td>{{ week.exercises }}</td>
                <td>
                  <span [class]="getDifficultyClass(week.difficulty)">
                    {{ getDifficultyLabel(week.difficulty) }}
                  </span>
                </td>
                <td>
                  <div class="load-increase">
                    <div class="load-bar">
                      <div class="load-fill" [style.width.%]="week.progressPercentage"></div>
                    </div>
                    <span>{{ week.progressPercentage }}%</span>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <!-- Мобильные карточки -->
        <div class="mobile-cards">
          @for (week of data!.weeks; track week.weekNumber) {
            <div class="week-card">
              <div class="card-header">
                <h3 class="week-title">{{ week.title }}</h3>
                <span class="week-subtitle">{{ week.subtitle }}</span>
                <span [class]="'difficulty-badge ' + getDifficultyClass(week.difficulty)">
                  {{ getDifficultyLabel(week.difficulty) }}
                </span>
              </div>

              <div class="card-content">
                <div class="card-row">
                  <span class="label">Тип тренировки:</span>
                  <span class="value">{{ week.workoutType }}</span>
                </div>

                <div class="card-row">
                  <span class="label">Упражнения:</span>
                  <span class="value">{{ week.exercises }}</span>
                </div>

                <div class="card-row">
                  <span class="label">Прогресс:</span>
                  <div class="progress-container">
                    <div class="load-bar">
                      <div class="load-fill" [style.width.%]="week.progressPercentage"></div>
                    </div>
                    <span class="progress-value">{{ week.progressPercentage }}%</span>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="no-data">
          <p>Расписание тренировок пока не доступно</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .schedule-section {
      padding: 20px 0;
    }

    .section-title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 20px;
      color: var(--md-sys-color-on-surface);
      position: relative;
      padding-bottom: 10px;
    }

    .section-title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 60px;
      height: 3px;
      background-color: var(--md-sys-color-primary);
      border-radius: 3px;
    }

    /* Десктопная таблица */
    .desktop-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border-radius: 12px;
      overflow: hidden;
      display: table;
    }

    .desktop-table th {
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
      padding: 15px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }

    .desktop-table td {
      padding: 12px 15px;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      font-size: 14px;
    }

    .desktop-table tr:last-child td {
      border-bottom: none;
    }

    .desktop-table tr:nth-child(even) {
      background-color: var(--md-sys-color-surface-variant);
    }

    /* Уровни сложности */
    .difficulty-beginner {
      padding: 4px 10px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: 500;
      background-color: var(--md-sys-color-secondary-container);
      color: var(--md-sys-color-on-secondary-container);
    }

    .difficulty-beginner-plus {
      padding: 4px 10px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: 500;
      background-color: var(--md-sys-color-tertiary-container);
      color: var(--md-sys-color-on-tertiary-container);
    }

    .difficulty-intermediate {
      padding: 4px 10px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: 500;
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }

    .difficulty-intermediate-plus {
      padding: 4px 10px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: 500;
      background-color: var(--md-sys-color-error-container);
      color: var(--md-sys-color-on-error-container);
    }

    /* Прогресс бар */
    .load-increase {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .load-bar {
      flex: 1;
      height: 8px;
      background-color: var(--md-sys-color-outline-variant);
      border-radius: 4px;
      overflow: hidden;
    }

    .load-fill {
      height: 100%;
      background-color: var(--md-sys-color-primary);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    /* Мобильные карточки */
    .mobile-cards {
      display: none;
      gap: 16px;
      flex-direction: column;
    }

    .week-card {
      background: var(--md-sys-color-surface);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--md-sys-color-outline-variant);
    }

    .card-header {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    .week-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      margin: 0;
    }

    .week-subtitle {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
      font-style: italic;
    }

    .difficulty-badge {
      align-self: flex-start;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .card-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .label {
      font-size: 12px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .value {
      font-size: 14px;
      color: var(--md-sys-color-on-surface);
      line-height: 1.4;
    }

    .progress-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-value {
      font-size: 12px;
      font-weight: 600;
      color: var(--md-sys-color-primary);
      min-width: 40px;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: var(--md-sys-color-outline);
      font-style: italic;
    }

    /* Адаптивность */
    @media (max-width: 1024px) {
      .desktop-table {
        font-size: 13px;
      }

      .desktop-table th,
      .desktop-table td {
        padding: 10px 12px;
      }
    }

    @media (max-width: 1024px) {
      .desktop-table {
        display: none;
      }

      .mobile-cards {
        display: flex;
      }

      .section-title {
        font-size: 20px;
        margin-bottom: 16px;
      }
    }

    @media (max-width: 480px) {
      .schedule-section {
        padding: 16px 0;
      }

      .week-card {
        padding: 12px;
      }

      .week-title {
        font-size: 16px;
      }

      .value {
        font-size: 13px;
      }
    }
  `]
})
export class ChallengeDetailCatalogScheduleComponent {
  @Input() data: ChallengeDetailCatalogSchedule | null = null;

  private difficultyStyles: Record<string, DifficultyStyle> = {
    'beginner': { class: 'difficulty-beginner', label: 'Начинающий' },
    'beginner-plus': { class: 'difficulty-beginner-plus', label: 'Начинающий+' },
    'intermediate': { class: 'difficulty-intermediate', label: 'Средний' },
    'intermediate-plus': { class: 'difficulty-intermediate-plus', label: 'Средний+' },
    'advanced': { class: 'difficulty-intermediate-plus', label: 'Продвинутый' }
  };

  getDifficultyClass(difficulty: string): string {
    return this.difficultyStyles[difficulty]?.class || 'difficulty-beginner';
  }

  getDifficultyLabel(difficulty: string): string {
    return this.difficultyStyles[difficulty]?.label || 'Начинающий';
  }
}
