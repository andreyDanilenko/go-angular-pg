import { Component } from '@angular/core';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
})
export class ThemeToggleComponent {
  constructor(private themeService: ThemeService) {}

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
