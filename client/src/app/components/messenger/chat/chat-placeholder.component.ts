import { Component } from '@angular/core';

@Component({
  selector: 'app-chat-placeholder',
  standalone: true,
  template: `
    <div class="chat-placeholder">
      <div class="placeholder-content">
        <div class="placeholder-icon">💬</div>
        <h3>Выберите чат</h3>
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
      background-color: var(--background-color);
    }

    .placeholder-content {
      text-align: center;
      max-width: 300px;
    }

    .placeholder-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    h3 {
      margin-bottom: 8px;
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
    }
  `]
})
export class ChatPlaceholderComponent {}
