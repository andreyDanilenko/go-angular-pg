import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChallengeDetailCatalogMeta, ChallengeMetaItem } from '../../../types/сhallengeCatalogDetail';

@Component({
  selector: 'app-challenge-detail-catalog-meta',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="challenge-header" [style.background]="getGradient()">
      <span
        class="challenge-category"
        [style.backgroundColor]="data?.categoryColor ? data!.categoryColor + '40' : 'rgba(255, 255, 255, 0.2)'"
      >
        {{ data?.category || 'Категория' }}
      </span>

      <h1 class="challenge-title">{{ data?.title || 'Название челленджа' }}</h1>

      <p class="challenge-subtitle">{{ data?.subtitle || 'Описание челленджа' }}</p>

      @if (data) {
        <div class="challenge-meta">
          @for (metaItem of getMetaItems(); track metaItem) {
            <div class="meta-item">
              <span>{{ metaItem.icon }}</span>
              <span>{{ metaItem.text }}</span>
            </div>
          }
        </div>
      }


      @if (!data) {
        <div class="challenge-meta">
          @for (item of placeholderMetaItems; track item) {
            <div class="meta-item">
              <span>{{ item.icon }}</span>
              <span>Загрузка...</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .challenge-header {
        padding: 30px;
        background: linear-gradient(135deg, var(--md-sys-color-primary-container), var(--md-sys-color-primary));
        color: var(--md-sys-color-on-primary-container);
        transition: all 0.3s ease;
    }

    .challenge-category {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 15px;
        backdrop-filter: blur(10px);
    }

    .challenge-title {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 15px;
        color: var(--md-sys-color-on-primary);
        line-height: 1.2;
    }

    .challenge-subtitle {
        font-size: 18px;
        opacity: 0.9;
        margin-bottom: 20px;
        color: var(--md-sys-color-on-primary);
        line-height: 1.4;
    }

    .challenge-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-top: 20px;
    }

    .meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        color: var(--md-sys-color-on-primary);
    }

    /* Адаптивность */
    @media (max-width: 768px) {
        .challenge-header {
            padding: 20px;
        }

        .challenge-title {
            font-size: 24px;
        }

        .challenge-subtitle {
            font-size: 16px;
        }

        .challenge-meta {
            gap: 15px;
        }

        .meta-item {
            font-size: 14px;
        }
    }
  `]
})
export class ChallengeDetailCatalogMetaComponent {
  @Input() data: ChallengeDetailCatalogMeta | null = null;
  @Input() customGradient?: string;

  private defaultMetaItems: ChallengeMetaItem[] = [
    { icon: '📅', text: 'duration' },
    { icon: '⏰', text: 'timePerDay' },
    { icon: '💪', text: 'difficulty' },
    { icon: '🏠', text: 'location' }
  ];

  placeholderMetaItems = [
    { icon: '📅', text: 'Загрузка...' },
    { icon: '⏰', text: 'Загрузка...' },
    { icon: '💪', text: 'Загрузка...' },
    { icon: '🏠', text: 'Загрузка...' }
  ];

  getMetaItems(): ChallengeMetaItem[] {
    if (!this.data) return [];

    return this.defaultMetaItems.map(item => ({
      ...item,
      text: this.data![item.text as keyof ChallengeDetailCatalogMeta] as string
    }));
  }

  getGradient(): string {
    if (this.customGradient) {
      return this.customGradient;
    }

    if (this.data?.categoryColor) {
      return `linear-gradient(135deg, ${this.data.categoryColor}40, ${this.data.categoryColor})`;
    }

    return 'linear-gradient(135deg, var(--md-sys-color-primary-container), var(--md-sys-color-primary))';
  }
}
