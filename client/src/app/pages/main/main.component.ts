import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styles: [`
      :host {
        height: calc(100dvh - var(--app-height));
        color: var(--md-sys-color-on-surface);
        padding: var(--space-6);
        overflow: scroll;
      }

      /* ------------------------------
        Демонстрационные сетки и палитра
        ------------------------------ */
      .section {
        margin: 18px 0;
      }

      .h1 {
        font-size: 18px;
        margin-bottom: 8px;
        font-weight: 700;
      }

      /* grid для кнопок */
      .button-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 10px 14px;
        align-items: center;
        margin-bottom: 12px;
      }

      /* подпись размера */
      .size-label {
        grid-column: 1 / -1;
        font-weight: 700;
        margin: 12px 0 6px;
      }

      /* палитра (palette swatches) */
      .palette {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 10px;
        margin-bottom: 18px;
      }
      .swatch {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px;
        border-radius: 8px;
        background: rgba(0,0,0,0.02);
      }
      .swatch .sample {
        width: 36px;
        height: 36px;
        border-radius: 6px;
        border: 1px solid rgba(0,0,0,0.06);
      }
      .swatch .meta { font-size: 13px; color: var(--md-sys-color-on-surface); }
      .small { font-size: 12px; color: var(--md-sys-color-on-surface); opacity: 0.85; }

      /* удобный контейнер для демки */
      .card {
        background: var(--md-sys-color-surface-container-low);
        padding: 14px;
        border-radius: 10px;
        box-shadow: 0 6px 16px rgba(11,24,40,0.04);
        border: 1px solid var(--md-sys-color-surface-container);
      }
  `]
})
export class HomeComponent {
    onOptionClick1() {
      console.log('Выбрана опци 1');
    }
    onOptionClick2() {
      console.log('Выбрана опци 2');
    }
}
