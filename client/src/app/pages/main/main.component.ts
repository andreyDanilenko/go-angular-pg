import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styles: []
})
export class HomeComponent {
    onOptionClick1() {
      console.log('Выбрана опци 1');
    }
    onOptionClick2() {
      console.log('Выбрана опци 2');
    }
}
