import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'user_theme';
  private readonly LIGHT_THEME_CLASS = 'light';
  private readonly DARK_THEME_CLASS = 'dark';

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      this.applyTheme(savedTheme as 'light' | 'dark');
    } else {
      // Опционально: можно использовать prefers-color-scheme по умолчанию
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  public toggleTheme(): void {
    const currentTheme = this.getCurrentTheme();
    this.setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }

  public setTheme(theme: 'light' | 'dark'): void {
    this.applyTheme(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    // Удаляем оба класса на всякий случай
    document.body.classList.remove(this.LIGHT_THEME_CLASS, this.DARK_THEME_CLASS);
    // Добавляем нужный класс
    document.body.classList.add(theme === 'dark' ? this.DARK_THEME_CLASS : this.LIGHT_THEME_CLASS);
  }

  private getCurrentTheme(): 'light' | 'dark' {
    return document.body.classList.contains(this.DARK_THEME_CLASS) ? 'dark' : 'light';
  }

  public isDarkMode(): boolean {
    return this.getCurrentTheme() === 'dark';
  }
}
