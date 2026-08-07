import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  standalone: true,
  template: '<div class="alert" role="alert"><ng-content /></div>',
  styles: `
    .alert {
      padding: var(--space-3) var(--space-4);
      border: var(--border-width) solid var(--color-danger);
      border-radius: var(--radius-md);
      color: var(--color-danger);
      background: var(--color-danger-surface);
      font-size: var(--font-size-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {}
