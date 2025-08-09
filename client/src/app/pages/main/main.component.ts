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
