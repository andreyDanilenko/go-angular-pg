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

      <!-- Мотивирующий баннер -->
      @if (data?.warningLevel) {
        <div class="motivation-banner" [class]="getMotivationLevelClass()">
          <span class="motivation-icon">{{ getMotivationIcon() }}</span>
          <div class="motivation-content">
            <h3 class="motivation-title">{{ getMotivationTitle() }}</h3>
            <p class="motivation-description">{{ getMotivationDescription() }}</p>
          </div>
        </div>
      }

      <!-- Стратегии коррекции -->
      @if (data?.strategies && data!.strategies.length > 0) {
        <div class="strategies-section">
          <h3 class="strategies-title">Адаптация программы под ваши ощущения</h3>
          <p class="strategies-subtitle">Каждый организм уникален - выбирайте подходящий вариант коррекции:</p>

          <div class="strategies-grid">
            @for (strategy of data!.strategies; track strategy.title; let i = $index) {
              <div class="strategy-card" [class]="'intensity-' + strategy.intensity">
                <div class="strategy-header">
                  <span class="strategy-icon">{{ strategy.icon }}</span>
                  <div class="strategy-intensity">
                    <div class="intensity-bar">
                      <div class="intensity-fill" [style.width.%]="strategy.intensity * 20"></div>
                    </div>
                    <span class="intensity-label">Уровень адаптации: {{ strategy.intensity }}/5</span>
                  </div>
                </div>

                <h4 class="strategy-title">{{ strategy.title }}</h4>
                <p class="strategy-description">{{ strategy.description }}</p>

                @if (strategy.conditions && strategy.conditions.length > 0) {
                  <div class="strategy-conditions">
                    <span class="conditions-label">Когда это поможет:</span>
                    <ul class="conditions-list">
                      @for (condition of strategy.conditions; track condition) {
                        <li class="condition-item">{{ condition }}</li>
                      }
                    </ul>
                  </div>
                }

                <div class="strategy-encouragement">
                  {{ getEncouragementText(strategy.intensity) }}
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Позитивные рекомендации -->
      @if (data?.recommendations && data!.recommendations.length > 0) {
        <div class="recommendations-section">
          <h3 class="recommendations-title">💫 Советы для комфортного прогресса</h3>
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

      <!-- Забота о себе (бывшие экстренные ситуации) -->
      @if (data?.emergencyActions && data!.emergencyActions!.length > 0) {
        <div class="selfcare-section">
          <h3 class="selfcare-title">❤️ Забота о себе</h3>
          <p class="selfcare-subtitle">Ваше здоровье - главный приоритет. Обратите внимание на эти сигналы:</p>

          <div class="selfcare-cards">
            @for (action of data!.emergencyActions; track action.situation) {
              <div class="selfcare-card" [class.important]="action.immediate">
                <div class="selfcare-header">
                  <span class="selfcare-alert">{{ getSelfcareIcon(action.immediate) }}</span>
                  <h4 class="selfcare-situation">{{ action.situation }}</h4>
                </div>
                <p class="selfcare-action">{{ action.action }}</p>
                @if (action.immediate) {
                  <div class="selfcare-priority">Особое внимание</div>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- Финальное мотивирующее сообщение -->
      <div class="final-motivation">
        <div class="motivation-heart">💖</div>
        <h3>Помните: адаптация - это признак роста</h3>
        <p>Корректируя нагрузку, вы не сдаетесь, а проявляете мудрость и заботу о своем теле. Каждый шаг - это прогресс!</p>
      </div>

      <!-- Плейсхолдер -->
      @if (!data) {
        <div class="loading-placeholder">
          <div class="placeholder-banner"></div>
          <div class="placeholder-grid">
            @for (item of [1,2,3,4,5,6]; track item) {
              <div class="placeholder-card"></div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
/* Обновленные стили для компонента коррекции */
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

/* Мотивирующий баннер - используем surface-variant для контраста */
.motivation-banner {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 32px;
  background-color: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface-variant);
  border: 1px solid var(--md-sys-color-outline-variant);
}

.motivation-banner.low {
  background-color: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
  border-left: 4px solid var(--md-sys-color-tertiary);
}

.motivation-banner.medium {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-left: 4px solid var(--md-sys-color-primary);
}

.motivation-banner.high {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  border-left: 4px solid var(--md-sys-color-secondary);
}

.motivation-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.motivation-content {
  flex: 1;
}

.motivation-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.motivation-description {
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
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
  border-radius: 16px;
  padding: 24px;
  border: 1px solid var(--md-sys-color-outline-variant);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.strategy-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--md-sys-color-primary);
}

.strategy-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.strategy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.strategy-icon {
  font-size: 32px;
}

.strategy-intensity {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.intensity-bar {
  width: 80px;
  height: 6px;
  background-color: var(--md-sys-color-surface-variant);
  border-radius: 3px;
  overflow: hidden;
}

.intensity-fill {
  height: 100%;
  background: var(--md-sys-color-primary);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.intensity-label {
  font-size: 11px;
  color: var(--md-sys-color-on-surface-variant);
  font-weight: 500;
}

.strategy-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--md-sys-color-on-surface);
}

.strategy-description {
  font-size: 14px;
  color: var(--md-sys-color-on-surface-variant);
  line-height: 1.5;
  margin-bottom: 16px;
}

.strategy-conditions {
  margin-top: 16px;
  padding: 16px;
  background: var(--md-sys-color-surface-variant);
  border-radius: 8px;
}

.conditions-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--md-sys-color-primary);
  display: block;
  margin-bottom: 8px;
}

.conditions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.condition-item {
  font-size: 13px;
  color: var(--md-sys-color-on-surface);
  padding: 4px 0;
  padding-left: 16px;
  position: relative;
}

.condition-item::before {
  content: '🌱';
  position: absolute;
  left: 0;
  font-size: 12px;
}

.strategy-encouragement {
  margin-top: 16px;
  padding: 12px;
  background: var(--md-sys-color-surface-container-low);
  border-radius: 8px;
  font-size: 13px;
  font-style: italic;
  color: var(--md-sys-color-on-surface-variant);
  text-align: center;
}

/* Рекомендации */
.recommendations-section {
  margin-bottom: 40px;
}

.recommendations-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--md-sys-color-on-surface);
  display: flex;
  align-items: center;
  gap: 8px;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  transition: all 0.3s ease;
}

.recommendation-item:hover {
  background: var(--md-sys-color-surface-container-low);
}

.recommendation-item.type-important {
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-color: var(--md-sys-color-primary);
}

.recommendation-item.type-warning {
  background: var(--md-sys-color-tertiary-container);
  color: var(--md-sys-color-on-tertiary-container);
  border-color: var(--md-sys-color-tertiary);
}

.recommendation-item.type-tip {
  background: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  border-color: var(--md-sys-color-secondary);
}

.recommendation-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}

.recommendation-text {
  font-size: 14px;
  line-height: 1.5;
}

/* Забота о себе */
.selfcare-section {
  margin-bottom: 40px;
}

.selfcare-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--md-sys-color-on-surface);
  display: flex;
  align-items: center;
  gap: 8px;
}

.selfcare-subtitle {
  font-size: 14px;
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 24px;
}

.selfcare-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.selfcare-card {
  background: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 12px;
  padding: 20px;
  position: relative;
  transition: all 0.3s ease;
}

.selfcare-card.important {
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
  border-color: var(--md-sys-color-error);
}

.selfcare-card:hover {
  transform: translateY(-2px);
}

.selfcare-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.selfcare-alert {
  font-size: 20px;
}

.selfcare-situation {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.selfcare-action {
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
  opacity: 0.9;
}

.selfcare-priority {
  position: absolute;
  top: -8px;
  right: 12px;
  background: var(--md-sys-color-error);
  color: var(--md-sys-color-on-error);
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
}

/* Финальная мотивация */
.final-motivation {
  text-align: center;
  padding: 40px 20px;
  background: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-radius: 20px;
  margin-top: 40px;
}

.motivation-heart {
  font-size: 48px;
  margin-bottom: 16px;
}

.final-motivation h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}

.final-motivation p {
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.5;
  max-width: 600px;
  margin: 0 auto;
}

/* Адаптивность */
@media (max-width: 768px) {
  .strategies-grid {
    grid-template-columns: 1fr;
  }

  .selfcare-cards {
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

  .motivation-banner {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .final-motivation {
    padding: 30px 16px;
  }
}
  `]
})
export class ChallengeDetailCatalogCorrectionComponent {
  @Input() data: ChallengeDetailCatalogCorrection | null = null;

  getMotivationLevelClass(): string {
    return this.data?.warningLevel || 'medium';
  }

  getMotivationIcon(): string {
    const icons = {
      'low': '💫',
      'medium': '🌱',
      'high': '❤️'
    };
    return icons[this.data?.warningLevel || 'medium'];
  }

  getMotivationTitle(): string {
    const titles = {
      'low': 'Вы на правильном пути!',
      'medium': 'Забота о себе - это мудрость',
      'high': 'Ваше здоровье - главный приоритет'
    };
    return titles[this.data?.warningLevel || 'medium'];
  }

  getMotivationDescription(): string {
    const descriptions = {
      'low': 'Небольшие корректировки помогут сделать тренировки еще комфортнее и эффективнее',
      'medium': 'Умение адаптировать программу под свои ощущения - признак опытного практика',
      'high': 'Проявление заботы о себе сейчас обеспечит устойчивый прогресс в будущем'
    };
    return descriptions[this.data?.warningLevel || 'medium'];
  }

  getRecommendationIcon(type: string): string {
    const icons = {
      'warning': '💡',
      'tip': '🌟',
      'important': '🎯'
    };
    return icons[type as keyof typeof icons] || '💡';
  }

  getSelfcareIcon(immediate: boolean): string {
    return immediate ? '❤️' : '💫';
  }

  getEncouragementText(intensity: number): string {
    const encouragements = {
      1: 'Небольшая настройка для идеального комфорта',
      2: 'Мудрое решение для плавного прогресса',
      3: 'Гибкость - ключ к устойчивым результатам',
      4: 'Забота о себе сегодня - инвестиция в завтрашний успех',
      5: 'Отдых - это тоже тренировка. Вы даете телу возможность стать сильнее'
    };
    return encouragements[intensity as keyof typeof encouragements] || 'Ваш прогресс важен на любом этапе';
  }
}
