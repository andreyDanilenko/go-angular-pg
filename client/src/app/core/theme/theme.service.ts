import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'user_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly currentTheme = signal<Theme>('light');

  readonly theme = this.currentTheme.asReadonly();

  initialize(): void {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const preferredTheme: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

    this.apply(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : preferredTheme);
  }

  toggle(): void {
    this.apply(this.currentTheme() === 'dark' ? 'light' : 'dark');
  }

  private apply(theme: Theme): void {
    this.currentTheme.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}
