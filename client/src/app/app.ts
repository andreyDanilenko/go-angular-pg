import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <h1>{{ title() }}</h1>
    <p>Счётчик: {{ counter() }}</p>
    <button (click)="decrement()">-</button>
    <button (click)="increment()">+</button>
  `,
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('client');

  counter = signal(0);

  increment() {
    this.counter.update(c => c + 1);
  }

  decrement() {
    this.counter.update(c => c - 1);
  }
}
