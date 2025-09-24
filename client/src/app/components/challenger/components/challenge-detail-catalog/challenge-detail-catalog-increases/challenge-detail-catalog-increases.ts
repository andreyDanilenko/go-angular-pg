import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeDetailCatalogIncreases } from '../../../types/сhallengeCatalogDetail';

@Component({
  selector: 'app-challenge-detail-catalog-increases',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="increases-section">
      <h2 class="section-title">{{ data?.title || 'Как увеличивается нагрузка' }}</h2>

      @if (data?.subtitle) {
        <p class="section-subtitle">{{ data!.subtitle }}</p>
      }

      @if (data?.principles && data!.principles.length > 0) {
        <div class="principles-grid">
          @for (principle of data!.principles; track principle.title; let i = $index) {
            <div class="principle-card" [class.animated]="shouldAnimate(i)">
              <div class="principle-header">
                <span class="principle-icon">{{ principle.icon }}</span>
                <h3 class="principle-title">{{ principle.title }}</h3>
              </div>

              <p class="principle-description">{{ principle.description }}</p>

              @if (principle.details && principle.details.length > 0) {
                <ul class="principle-details">
                  @for (detail of principle.details; track detail) {
                    <li class="detail-item">{{ detail }}</li>
                  }
                </ul>
              }

              <div class="principle-progress">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="(i + 1) * 20"></div>
                </div>
                <span class="progress-text">Этап {{ i + 1 }}</span>
              </div>
            </div>
          }
        </div>
      }

      @if (data?.recommendations && data!.recommendations!.length > 0) {
        <div class="recommendations-box">
          <div class="recommendations-header">
            <span class="recommendations-icon">💡</span>
            <h3 class="recommendations-title">Рекомендации по прогрессии</h3>
          </div>

          <ul class="recommendations-list">
            @for (recommendation of data!.recommendations; track recommendation) {
              <li class="recommendation-item">
                <span class="recommendation-bullet">•</span>
                {{ recommendation }}
              </li>
            }
          </ul>
        </div>
      }

      @if (!data) {
        <div class="placeholder">
          <p>Рекомендации челленджа отсутствуют</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .increases-section {
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
      margin-bottom: 30px;
      line-height: 1.5;
    }

    /* Сетка принципов */
    .principles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .principle-card {
      background: var(--md-sys-color-surface);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid var(--md-sys-color-outline-variant);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .principle-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(to bottom,
        var(--md-sys-color-primary),
        var(--md-sys-color-secondary));
    }

    .principle-card.animated {
      animation: fadeInUp 0.6s ease-out;
    }

    .principle-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .principle-icon {
      font-size: 32px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--md-sys-color-primary-container);
      border-radius: 12px;
    }

    .principle-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      margin: 0;
    }

    .principle-description {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
      line-height: 1.5;
      margin-bottom: 16px;
    }

    .principle-details {
      list-style: none;
      padding: 0;
      margin: 0 0 20px 0;
    }

    .detail-item {
      padding: 8px 0;
      padding-left: 20px;
      position: relative;
      font-size: 13px;
      color: var(--md-sys-color-on-surface);
      line-height: 1.4;
    }

    .detail-item::before {
      content: '▸';
      position: absolute;
      left: 0;
      color: var(--md-sys-color-primary);
      font-weight: bold;
    }

    .principle-progress {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: auto;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      background-color: var(--md-sys-color-outline-variant);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg,
        var(--md-sys-color-primary),
        var(--md-sys-color-tertiary));
      border-radius: 3px;
      transition: width 0.8s ease;
    }

    .progress-text {
      font-size: 12px;
      font-weight: 600;
      color: var(--md-sys-color-primary);
      min-width: 70px;
    }

    /* Блок рекомендаций */
    .recommendations-box {
      background: linear-gradient(135deg,
        var(--md-sys-color-primary-container) 0%,
        var(--md-sys-color-surface-container-high) 100%);
      border-radius: 16px;
      padding: 24px;
      border-left: 4px solid var(--md-sys-color-primary);
    }

    .recommendations-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .recommendations-icon {
      font-size: 24px;
    }

    .recommendations-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--md-sys-color-on-primary-container);
      margin: 0;
    }

    .recommendations-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .recommendation-item {
      padding: 8px 0;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      color: var(--md-sys-color-on-surface);
      line-height: 1.5;
    }

    .recommendation-bullet {
      color: var(--md-sys-color-primary);
      font-weight: bold;
      font-size: 16px;
      line-height: 1.2;
    }

    /* Плейсхолдер загрузки */
    .loading-placeholder {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .placeholder-card {
      background: var(--md-sys-color-surface-variant);
      border-radius: 16px;
      padding: 24px;
      height: 200px;
      animation: pulse 2s infinite;
    }

    .placeholder {
      text-align: center;
      padding: 40px;
      color: var(--md-sys-color-outline);
      font-style: italic;
    }

    /* Анимации */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 0.8; }
      100% { opacity: 0.6; }
    }

    /* Адаптивность */
    @media (max-width: 768px) {
      .principles-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .principle-card {
        padding: 20px;
      }

      .principle-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .principle-icon {
        width: 40px;
        height: 40px;
        font-size: 24px;
      }

      .section-title {
        font-size: 20px;
      }

      .recommendations-box {
        padding: 20px;
      }
    }

    @media (max-width: 480px) {
      .increases-section {
        padding: 16px 0;
      }

      .principle-card {
        padding: 16px;
      }

      .principles-grid {
        gap: 12px;
      }
    }
  `]
})
export class ChallengeDetailCatalogIncreasesComponent {
  @Input() data: ChallengeDetailCatalogIncreases | null = null;

  shouldAnimate(index: number): boolean {
    return index < 5;
  }
}
