import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-info-modal',
  standalone: true,
  template: `
      <div class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <div class="icon-circle">
              <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              </svg>
            </div>
          </div>

          <h2 class="modal-title">Проект в разработке</h2>

          <p class="modal-text">
            Система находится на стадии разработки и доступна только по приглашению.
          </p>

          <p class="modal-text">
            Если вы уже регистрировались ранее, введите любое значени в поле "Код приглашения"!
          </p>

          <div class="contact-buttons">
            <a href="https://t.me/danilllenko" target="_blank" class="btn-telegram">
              <svg class="icon-small" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.25 8.4c-.088-.28-.388-.96-.537-1.44-.15-.48-.3-.42-.45 0-.15.42-.3.6-.562.51-.263-.09-.938-.39-1.813-.66-1.35-.42-2.138-.51-3.375-.15-1.238.36-2.1 1.56-2.25 2.34-.15.78.3 1.44.825 1.98.075.06.33.21.6.36.263.15.525.3.525.3l.15.06c.075.03.15.09.3.03.15-.06.6-.27.938-.42.287-.15.6-.24.675-.36.075-.12-.037-.21-.15-.3-.112-.09-.225-.18-.337-.27-.113-.09-.225-.27-.338-.42-.112-.15-.075-.225.037-.3.113.075.263.18.413.27.15.09.3.18.45.24.15.06.3.03.413-.03.112-.06.337-.3.487-.51.15-.21.3-.51.375-.66.075-.15.038-.225-.075-.225-.075 0-.225.03-.45.15-.225.12-.525.24-.825.36-.3.12-.6.18-.825.18-.225 0-.375-.06-.525-.24-.15-.18-.3-.54-.412-.87-.113-.33-.188-.72-.188-1.14 0-.84.338-1.56.938-2.16.6-.6 1.35-.9 2.25-.9.45 0 .938.09 1.425.3l.3.15c.45.18.863.39 1.238.66.375.27.675.57.9 1.02.225.45.337.96.337 1.53 0 .42-.075.84-.225 1.26-.15.42-.375.78-.675 1.08-.3.3-.6.51-.9.63-.3.12-.6.15-.9.09z"/>
              </svg>
              Написать в Telegram
            </a>
          </div>

          <p class="note">
            Для получения доступа свяжитесь с разработчиком напрямую
          </p>

          <button type="button" class="btn-close" (click)="onCancel()">
            Отмена
          </button>
        </div>
      </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .modal {
      background-color: var(--md-sys-color-surface);
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--md-sys-color-surface-variant);
      max-width: 400px;
      width: 100%;
      overflow: hidden;
    }

    .modal-content {
      padding: 24px;
    }

    .modal-header {
      display: flex;
      justify-content: center;
      margin-bottom: 16px;
    }

    .icon-circle {
      width: 40px;
      height: 40px;
      background-color: var(--md-sys-color-primary-container);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon {
      width: 20px;
      height: 20px;
      fill: var(--md-sys-color-on-primary);
    }

    .modal-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
      text-align: center;
      margin-bottom: 12px;
    }

    .modal-text {
      font-size: 0.875rem;
      color: var(--md-sys-color-on-surface);
      text-align: center;
      line-height: 1.5;
      margin-bottom: 24px;
    }

    .contact-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    .btn-telegram {
      background-color: #0088cc;
      color: white;
      padding: 12px;
      border-radius: 8px;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-weight: 500;
      font-size: 0.875rem;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: #006aa3;
      }
    }

    .btn-email {
      border: 1px solid var(--md-sys-color-surface-variant);
      color: var(--md-sys-color-on-surface);
      padding: 12px;
      border-radius: 8px;
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-weight: 500;
      font-size: 0.875rem;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: var(--md-sys-color-surface-container-low);
      }
    }

    .icon-small {
      width: 16px;
      height: 16px;
    }

    .note {
      font-size: 0.75rem;
      color: var(--md-sys-color-outline);
      text-align: center;
      margin-bottom: 24px;
    }

    .btn-close {
      width: 100%;
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: var(--md-sys-color-primary-fixed-dim);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class AuthInfoComponent {

  @Input() onCancel!: () => void;

}
