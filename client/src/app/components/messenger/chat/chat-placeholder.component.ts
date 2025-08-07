import { Component } from '@angular/core';

@Component({
  selector: 'app-chat-placeholder',
  standalone: true,
  template: `
    <div class="chat-placeholder">
      <div class="placeholder-content">
        <div class="placeholder-icon">💬</div>
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
      background-color: var(--md-sys-color-surface);
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
