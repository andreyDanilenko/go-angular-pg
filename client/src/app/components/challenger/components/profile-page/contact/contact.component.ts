import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileContact } from '../../../types/profileContact';

@Component({
  selector: 'app-challenge-profile-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contact-item" [class]="'contact-' + contact?.type">
      <div class="contact-icon">{{ getContactIcon(contact?.type) }}</div>
      <div class="contact-details">
        <h4>{{ getContactLabel(contact) }}</h4>
        <p>{{ contact?.value }}</p>
      </div>
      <div class="contact-actions">
        <button class="contact-action-btn" (click)="handleContactAction(contact)">
          {{ getActionIcon(contact?.type) }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .contact-item {
      display: flex;
      align-items: center;
      padding: 16px;
      border-radius: 16px;
      background-color: var(--md-sys-color-surface-variant);
      transition: all 0.3s ease;
      margin-bottom: 12px;
      border: 2px solid transparent;
    }

    .contact-item:hover {
      background-color: var(--md-sys-color-surface-container-low);
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .contact-email {
      border-left: 4px solid var(--md-sys-color-primary);
    }

    .contact-phone {
      border-left: 4px solid var(--md-sys-color-success);
    }

    .contact-telegram {
      border-left: 4px solid var(--md-sys-color-info);
    }

    .contact-instagram {
      border-left: 4px solid var(--md-sys-color-secondary);
    }

    .contact-website {
      border-left: 4px solid var(--md-sys-color-tertiary);
    }

    .contact-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--md-sys-color-primary-container), var(--md-sys-color-secondary-container));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      color: var(--md-sys-color-on-primary-container);
      font-weight: bold;
      font-size: 18px;
      flex-shrink: 0;
    }

    .contact-details {
      flex: 1;
    }

    .contact-details h4 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--md-sys-color-on-surface);
    }

    .contact-details p {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant);
      margin: 0;
      word-break: break-word;
    }

    .contact-actions {
      margin-left: 12px;
    }

    .contact-action-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: var(--md-sys-color-surface);
      color: var(--md-sys-color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 16px;
    }

    .contact-action-btn:hover {
      background: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      transform: scale(1.1);
    }

    /* Адаптивность */
    @media (max-width: 480px) {
      .contact-item {
        padding: 12px;
      }

      .contact-icon {
        width: 36px;
        height: 36px;
        font-size: 16px;
        margin-right: 12px;
      }

      .contact-details h4 {
        font-size: 14px;
      }

      .contact-details p {
        font-size: 13px;
      }
    }
  `]
})
export class ChallengeProfileContactComponent {
  @Input() contact: ProfileContact | null = null;

  getContactIcon(type?: string): string {
    switch (type) {
      case 'email': return '✉️';
      case 'phone': return '📱';
      case 'telegram': return '📨';
      case 'instagram': return '📸';
      case 'website': return '🌐';
      default: return '📋';
    }
  }

  getContactLabel(contact: ProfileContact | null): string {
    if (!contact) return 'Контакт';
    return contact.label || this.getDefaultLabel(contact.type);
  }

  getDefaultLabel(type: string): string {
    switch (type) {
      case 'email': return 'Email';
      case 'phone': return 'Телефон';
      case 'telegram': return 'Telegram';
      case 'instagram': return 'Instagram';
      case 'website': return 'Сайт';
      default: return 'Контакт';
    }
  }

  getActionIcon(type?: string): string {
    switch (type) {
      case 'email': return '📧';
      case 'phone': return '📞';
      case 'telegram': return '✈️';
      case 'instagram': return '👀';
      case 'website': return '🔗';
      default: return '👉';
    }
  }

  handleContactAction(contact: ProfileContact | null): void {
    if (!contact) return;

    switch (contact.type) {
      case 'email':
        window.location.href = `mailto:${contact.value}`;
        break;
      case 'phone':
        window.location.href = `tel:${contact.value}`;
        break;
      case 'telegram':
        window.open(`https://t.me/${contact.value.replace('@', '')}`, '_blank');
        break;
      case 'instagram':
        window.open(`https://instagram.com/${contact.value.replace('@', '')}`, '_blank');
        break;
      case 'website':
        window.open(`https://${contact.value}`, '_blank');
        break;
    }
  }
}
