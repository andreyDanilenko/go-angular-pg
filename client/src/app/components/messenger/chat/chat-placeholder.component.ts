import { Component } from '@angular/core';

@Component({
  selector: 'app-chat-placeholder',
  standalone: true,
  template: `
    <div class="chat-placeholder">
      <div class="placeholder-content">
        <div class="placeholder-icon">
          <svg class="placeholder-icon-svg" width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 12C20 16.4183 16.4183 20 12 20C10.4633 20 9.0615 19.4229 8 18.5L4 20L5.5 16C4.57714 14.9385 4 13.5367 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" stroke="var(--md-sys-color-on-surface)" stroke-width="1"/>
            <circle cx="9" cy="12" r="1" fill="var(--md-sys-color-on-surface)"/>
            <circle cx="12" cy="12" r="1" fill="var(--md-sys-color-on-surface)"/>
            <circle cx="15" cy="12" r="1" fill="var(--md-sys-color-on-surface)"/>
          </svg>
        </div>
        <p>Выберите чат из списка слева или создайте новый</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      height: 100%;
    }
    .chat-placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      background-color: var(--md-sys-color-background);
    }

    .placeholder-content {
      text-align: center;
      max-width: 300px;
    }

    .placeholder-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    p {
      color: var(--md-sys-color-on-surface);
    }
  `]
})
export class ChatPlaceholderComponent {}
