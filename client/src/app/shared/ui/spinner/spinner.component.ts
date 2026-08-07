import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <div class="loading" role="status">
      <span class="loading__spinner" aria-hidden="true"></span>
      <span>{{ label }}</span>
    </div>
  `,
  styles: `
    .loading {
      min-height: 12rem;
      display: grid;
      place-items: center;
      align-content: center;
      gap: var(--space-4);
      color: var(--color-text-muted);
    }

    .loading__spinner {
      width: 2rem;
      height: 2rem;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-action);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(1turn);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .loading__spinner {
        animation-duration: 1.6s;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  @Input() label = 'Загрузка…';
}
