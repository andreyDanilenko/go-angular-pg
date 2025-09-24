import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeDetailCatalogCorrection } from '../../../types/сhallengeCatalogDetail';

@Component({
  selector: 'app-challenge-detail-catalog-correction',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="correction-section">
      <h2 class="section-title">{{ data?.title || 'Коррекция нагрузки при трудностях' }}</h2>

      @if (data?.subtitle) {
        <p class="section-subtitle">{{ data!.subtitle }}</p>
      }

      <!-- Предупреждение -->
      @if (data?.warningLevel) {
        <div class="warning-banner" [class]="getWarningLevelClass()">
          <span class="warning-icon">{{ getWarningIcon() }}</span>
          <div class="warning-content">
            <h3 class="warning-title">{{ getWarningTitle() }}</h3>
            <p class="warning-description">{{ getWarningDescription() }}</p>
          </div>
        </div>
      }

      <!-- Стратегии коррекции -->
      @if (data?.strategies && data!.strategies.length > 0) {
        <div class="strategies-section">
          <h3 class="strategies-title">Стратегии коррекции нагрузки</h3>
          <p class="strategies-subtitle">Выберите подходящую стратегию в зависимости от вашего самочувствия:</p>

          <div class="strategies-grid">
            @for (strategy of data!.strategies; track strategy.title; let i = $index) {
              <div class="strategy-card" [class]="'intensity-' + strategy.intensity">
                <div class="strategy-header">
                  <span class="strategy-icon">{{ strategy.icon }}</span>
                  <div class="strategy-intensity">
                    <div class="intensity-dots">
                      @for (dot of [1,2,3,4,5]; track dot) {
                        <span class="intensity-dot" [class.active]="dot <= strategy.intensity"></span>
                      }
                    </div>
                    <span class="intensity-label">Уровень коррекции: {{ strategy.intensity }}/5</span>
                  </div>
                </div>

                <h4 class="strategy-title">{{ strategy.title }}</h4>
                <p class="strategy-description">{{ strategy.description }}</p>

                @if (strategy.conditions && strategy.conditions.length > 0) {
                  <div class="strategy-conditions">
                    <span class="conditions-label">Когда применять:</span>
                    <ul class="conditions-list">
                      @for (condition of strategy.conditions; track condition) {
                        <li class="condition-item">{{ condition }}</li>
                      }
                    </ul>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- Рекомендации -->
      @if (data?.recommendations && data!.recommendations.length > 0) {
        <div class="recommendations-section">
          <h3 class="recommendations-title">Общие рекомендации</h3>
          <div class="recommendations-list">
            @for (recommendation of data!.recommendations; track recommendation.text) {
              <div class="recommendation-item" [class]="'type-' + recommendation.type">
                <span class="recommendation-icon">{{ getRecommendationIcon(recommendation.type) }}</span>
                <span class="recommendation-text">{{ recommendation.text }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Экстренные действия -->
      @if (data?.emergencyActions && data!.emergencyActions!.length > 0) {
        <div class="emergency-section">
          <h3 class="emergency-title">🚨 Экстренные ситуации</h3>
          <p class="emergency-subtitle">Что делать в критических ситуациях:</p>

          <div class="emergency-cards">
            @for (action of data!.emergencyActions; track action.situation) {
              <div class="emergency-card" [class.immediate]="action.immediate">
                <div class="emergency-header">
                  <span class="emergency-alert">⚠️</span>
                  <h4 class="emergency-situation">{{ action.situation }}</h4>
                </div>
                <p class="emergency-action">{{ action.action }}</p>
                @if (action.immediate) {
                  <div class="emergency-badge">Требует немедленных действий</div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- Плейсхолдер -->
      @if (!data) {
        <div class="placeholder">
          <p>Коррекция челленджа отсутствует</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .correction-section {
      padding: 20px 0;
    }

    .section-title {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 12px;
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

    .section-subtitle {
      font-size: 16px;
      color: var(--md-sys-color-on-surface-variant);
      margin-bottom: 24px;
      line-height: 1.5;
    }

    /* Баннер предупреждения */
    .warning-banner {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 32px;
      border-left: 4px solid;
    }

    .warning-banner.low {
      background-color: var(--md-sys-color-tertiary-container);
      border-left-color: var(--md-sys-color-tertiary);
      color: var(--md-sys-color-on-tertiary-container);
    }

    .warning-banner.medium {
      background-color: var(--md-sys-color-warning-container);
      border-left-color: var(--md-sys-color-warning);
      color: var(--md-sys-color-on-warning-container);
    }

    .warning-banner.high {
      background-color: var(--md-sys-color-error-container);
      border-left-color: var(--md-sys-color-error);
      color: var(--md-sys-color-on-error-container);
    }

    .warning-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .warning-content {
      flex: 1;
    }

    .warning-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .warning-description {
      font-size: 14px;
      margin: 0;
      opacity: 0.9;
    }

    /* Сетка стратегий */
    .strategies-section {
      margin-bottom: 40px;
    }

    .strategies-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--md-sys-color-on-surface);
    }

    .strategies-subtitle {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
      margin-bottom: 24px;
    }

    .strategies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 20px;
    }

    .strategy-card {
      background: var(--md-sys-color-surface);
      border-radius: 12px;
      padding: 20px;
      border: 1px solid var(--md-sys-color-outline-variant);
      transition: all 0.3s ease;
    }

    .strategy-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .strategy-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .strategy-icon {
      font-size: 28px;
    }

    .strategy-intensity {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }

    .intensity-dots {
      display: flex;
      gap: 2px;
    }

    .intensity-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--md-sys-color-outline-variant);
      transition: all 0.3s ease;
    }

    .intensity-dot.active {
      background-color: var(--md-sys-color-primary);
    }

    .intensity-label {
      font-size: 11px;
      color: var(--md-sys-color-on-surface-variant);
      font-weight: 500;
    }

    .strategy-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: var(--md-sys-color-on-surface);
    }

    .strategy-description {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
      line-height: 1.4;
      margin-bottom: 12px;
    }

    .strategy-conditions {
      margin-top: 12px;
    }

    .conditions-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--md-sys-color-primary);
      display: block;
      margin-bottom: 6px;
    }

    .conditions-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .condition-item {
      font-size: 12px;
      color: var(--md-sys-color-on-surface);
      padding: 2px 0;
      padding-left: 12px;
      position: relative;
    }

    .condition-item::before {
      content: '•';
      position: absolute;
      left: 0;
      color: var(--md-sys-color-primary);
    }

    /* Рекомендации */
    .recommendations-section {
      margin-bottom: 40px;
    }

    .recommendations-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--md-sys-color-on-surface);
    }

    .recommendations-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .recommendation-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      background: var(--md-sys-color-surface-variant);
    }

    .recommendation-item.type-important {
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }

    .recommendation-item.type-warning {
      background: var(--md-sys-color-error-container);
      color: var(--md-sys-color-on-error-container);
    }

    .recommendation-item.type-tip {
      background: var(--md-sys-color-tertiary-container);
      color: var(--md-sys-color-on-tertiary-container);
    }

    .recommendation-icon {
      font-size: 16px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .recommendation-text {
      font-size: 14px;
      line-height: 1.4;
    }

    /* Экстренные ситуации */
    .emergency-section {
      margin-bottom: 20px;
    }

    .emergency-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--md-sys-color-error);
    }

    .emergency-subtitle {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
      margin-bottom: 20px;
    }

    .emergency-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .emergency-card {
      background: var(--md-sys-color-surface);
      border: 2px solid var(--md-sys-color-outline-variant);
      border-radius: 12px;
      padding: 16px;
      position: relative;
    }

    .emergency-card.immediate {
      border-color: var(--md-sys-color-error);
      background: var(--md-sys-color-error-container);
    }

    .emergency-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .emergency-alert {
      font-size: 20px;
    }

    .emergency-situation {
      font-size: 14px;
      font-weight: 600;
      margin: 0;
      color: var(--md-sys-color-on-surface);
    }

    .emergency-card.immediate .emergency-situation {
      color: var(--md-sys-color-on-error-container);
    }

    .emergency-action {
      font-size: 13px;
      color: var(--md-sys-color-on-surface-variant);
      margin: 0;
      line-height: 1.4;
    }

    .emergency-card.immediate .emergency-action {
      color: var(--md-sys-color-on-error-container);
    }

    .emergency-badge {
      position: absolute;
      top: -8px;
      right: 12px;
      background: var(--md-sys-color-error);
      color: white;
      font-size: 10px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 8px;
    }

    .placeholder {
      text-align: center;
      padding: 40px;
      color: var(--md-sys-color-outline);
      font-style: italic;
    }

    /* Адаптивность */
    @media (max-width: 768px) {
      .strategies-grid {
        grid-template-columns: 1fr;
      }

      .emergency-cards {
        grid-template-columns: 1fr;
      }

      .strategy-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .strategy-intensity {
        align-items: flex-start;
      }

      .warning-banner {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class ChallengeDetailCatalogCorrectionComponent {
  @Input() data: ChallengeDetailCatalogCorrection | null = null;

  getWarningLevelClass(): string {
    return this.data?.warningLevel || 'medium';
  }

  getWarningIcon(): string {
    const icons = {
      'low': '💡',
      'medium': '⚠️',
      'high': '🚨'
    };
    return icons[this.data?.warningLevel || 'medium'];
  }

  getWarningTitle(): string {
    const titles = {
      'low': 'Рекомендации по нагрузке',
      'medium': 'Важная информация',
      'high': 'Внимание! Особые указания'
    };
    return titles[this.data?.warningLevel || 'medium'];
  }

  getWarningDescription(): string {
    const descriptions = {
      'low': 'Следующие рекомендации помогут вам адаптировать программу под свои возможности',
      'medium': 'Обратите внимание на эти стратегии коррекции для безопасного прогресса',
      'high': 'Строго следуйте указаниям для предотвращения травм и проблем со здоровьем'
    };
    return descriptions[this.data?.warningLevel || 'medium'];
  }

  getRecommendationIcon(type: string): string {
    const icons = {
      'warning': '⚠️',
      'tip': '💡',
      'important': '🎯'
    };
    return icons[type as keyof typeof icons] || '💡';
  }
}
