import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ContentType = 'post' | 'article';

@Component({
  selector: 'app-create-content-component',
  standalone: true,
  template: `
    <div class="create-content">
      <div class="content-options">
        <div class="option-card"
             [class.selected]="selectedType === 'post'"
             (click)="selectType('post')">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 12C20 16.4183 16.4183 20 12 20C10.4633 20 9.0615 19.4229 8 18.5L4 20L5.5 16C4.57714 14.9385 4 13.5367 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" stroke="var(--md-sys-color-on-primary-fixed-variant)" stroke-width="0.7"/>
              <circle cx="9" cy="12" r="1" fill="var(--md-sys-color-on-primary-fixed-variant)"/>
              <circle cx="12" cy="12" r="1" fill="var(--md-sys-color-on-primary-fixed-variant)"/>
              <circle cx="15" cy="12" r="1" fill="var(--md-sys-color-on-primary-fixed-variant)"/>
            </svg>
          <div class="option-info">
            <h4>Пост</h4>
            <p>Короткое сообщение для быстрых новостей</p>
          </div>
        </div>

        <div class="option-card"
            [class.disabled]="true"
            [class.selected]="selectedType === 'article'"
            (click)="selectType('article')">
          <svg width="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <rect x="15" y="10" width="70" height="80" rx="3" fill="white" stroke="var(--md-sys-color-on-primary-fixed-variant)" stroke-width="2.5"/>
                <line x1="25" y1="30" x2="75" y2="30" stroke="var(--md-sys-color-on-primary-fixed-variant)" stroke-width="2"/>
                <line x1="25" y1="40" x2="75" y2="40" stroke="var(--md-sys-color-on-primary-fixed-variant)" stroke-width="2"/>
                <line x1="25" y1="50" x2="75" y2="50" stroke="var(--md-sys-color-on-primary-fixed-variant)" stroke-width="2"/>
                <line x1="25" y1="60" x2="60" y2="60" stroke="var(--md-sys-color-on-primary-fixed-variant)" stroke-width="2"/>
                <rect x="25" y="22" width="40" height="4" fill="var(--md-sys-color-on-primary-fixed-variant)"/>
                <circle cx="80" cy="20" r="6" fill="var(--md-sys-color-secondary-fixed-dim)"/>
            </svg>
            <div class="option-info">
              <h4>Статья</h4>
              <p>Длинный формат с расширенным редактированием</p>
            </div>
        </div>
      </div>

      <div class="content-actions">
        <button type="button" class="btn btn-gray-outline" (click)="onCancel()">
          Отмена
        </button>
        <button type="button" class="btn btn-secondary"
                (click)="onConfirm()"
                [disabled]="!selectedType">
          Продолжить
        </button>
      </div>
    </div>
  `,
  styles: [`
    .create-title {
      margin-bottom: 1.5rem;
      text-align: center;
      color: var(--md-sys-color-on-surface);
    }
    .content-options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .option-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .option-card:hover {
      border-color: var(--md-sys-color-primary);
    }
    .option-card.selected {
      border-color: var(    --md-sys-color-on-surface);
      background-color: var(--md-sys-color-surface-variant);
    }
    .option-icon {
      font-size: 2rem;
      flex-shrink: 0;
    }
    .content-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }
    .option-card.disabled {
      background-color: var(--md-sys-color-surface-container-highest);
      color: var(--md-sys-color-on-surface-variant);
      border-color: var(--md-sys-color-outline-variant);
      cursor: not-allowed;
      opacity: 0.6;
      pointer-events: none;
    }
  `]
})
export class CreateContentComponent {
  selectedType: ContentType | null = null;

  @Input() onCancel!: () => void;
  @Input() onConfirmAction!: (type: ContentType) => void;

  selectType(type: ContentType) {
    this.selectedType = type;
  }

  onConfirm() {
    if (this.selectedType && this.onConfirmAction) {
      this.onConfirmAction(this.selectedType);
    }
  }
}
