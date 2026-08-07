import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { ThemeService } from '../../../core/theme/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      class="theme-toggle"
      type="button"
      [attr.aria-label]="label()"
      [attr.title]="label()"
      (click)="themeService.toggle()"
    >
      <span aria-hidden="true">{{ themeService.theme() === 'dark' ? '☀' : '☾' }}</span>
    </button>
  `,
  styleUrl: './theme-toggle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);
  readonly label = computed(() =>
    this.themeService.theme() === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему',
  );
}
