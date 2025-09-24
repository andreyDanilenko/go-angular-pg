import { Component, Input } from '@angular/core';
import { ChallengeDetailCatalogAbout } from '../../../types/сhallengeCatalogDetail';

@Component({
  selector: 'app-challenge-detail-catalog-about',
  standalone: true,
  imports: [],
  template: `
    <div class="about-section">
      <h2 class="section-title">{{ data?.title || 'О челлендже' }}</h2>

      @if (data?.description) {
        <p class="challenge-description">
          {{ data?.description || 'Описание челленджа' }}
        </p>
      }

      @if (data?.goals && data?.goals!.length > 0) {
        <div class="info-block">
          <h3 class="info-title">🎯 Цели челленджа</h3>
          <ul class="info-list">
            @for (goal of data!.goals; track goal) {
              <li class="info-item">
                {{ goal }}
              </li>
            }
          </ul>
        </div>
      }

      @if (data?.requirements && data!.requirements!.length > 0) {
        <div class="info-block">
          <h3 class="info-title">📋 Что понадобится</h3>
          <ul class="info-list">
            @for (requirement of data!.requirements; track requirement) {
              <li class="info-item">
                {{ requirement }}
              </li>
            }
          </ul>
        </div>
      }

      @if (data?.benefits && data?.benefits!.length > 0) {
        <div class="info-block">
          <h3 class="info-title">✨ Что вы получите</h3>
          <ul class="info-list">
            @for (benefit of data!.benefits; track benefit) {
              <li class="info-item">
                {{ benefit }}
              </li>
            }
          </ul>
        </div>
      }

      @if (!data) {
        <div class="placeholder">
          <p>Описание челленджа отсутствует</p>
        </div>
      }
    </div>
  `,
  styles: [`
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

    .challenge-description {
      font-size: 16px;
      color: var(--md-sys-color-on-surface-variant);
      line-height: 1.8;
      margin-bottom: 30px;
    }

    .info-block {
      margin-bottom: 25px;
    }

    .info-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      color: var(--md-sys-color-on-surface);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .info-item {
      padding: 8px 0;
      padding-left: 24px;
      position: relative;
      color: var(--md-sys-color-on-surface-variant);
      line-height: 1.6;
    }

    .info-item::before {
      content: '•';
      position: absolute;
      left: 8px;
      color: var(--md-sys-color-primary);
      font-weight: bold;
    }

    .placeholder {
      text-align: center;
      padding: 40px;
      color: var(--md-sys-color-outline);
      font-style: italic;
    }

    /* Адаптивность */
    @media (max-width: 768px) {
      .about-section {
        padding: 20px 0;
      }

      .section-title {
        font-size: 20px;
      }

      .challenge-description {
        font-size: 14px;
      }

      .info-title {
        font-size: 16px;
      }
    }
  `]
})
export class ChallengeDetailCatalogAboutComponent {
  @Input() data: ChallengeDetailCatalogAbout | null = null;
}
