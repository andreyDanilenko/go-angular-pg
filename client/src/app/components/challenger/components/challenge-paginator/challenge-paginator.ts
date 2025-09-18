import { Component } from '@angular/core';

@Component({
  selector: 'app-challenge-footer',
  standalone: true,
  imports: [],
  template: `
    <footer>
        <p>&copy; 2025 LifeDreamTech. Все права защищены.</p>
    </footer>
  `,
  styles: [`
    footer {
        text-align: center;
        padding: 30px 0;
        color: var(--md-sys-color-on-surface-variant);
        font-size: 14px;
        margin-top: 40px;
        border-top: 1px solid var(--md-sys-color-outline-variant);
        transition: color 0.3s ease, border-color 0.3s ease;
    }
  `]
})

export class FooterComponent {}
