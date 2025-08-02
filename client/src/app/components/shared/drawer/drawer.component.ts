import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('openClose', [
      state('open', style({ transform: 'translateX(100%)', opacity: '0', visibility: 'hidden'})),
      state('closed', style({ transform: 'translateX(0)' })),
      transition('open <=> closed', animate('300ms ease-in-out')),
    ]),
  ],
  template: `
    <div
      class="drawer"
      [@openClose]="isOpen ? 'open' : 'closed'"
      [ngStyle]="{ 'min-width': minWidth, 'width': width }"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .drawer {
      position: absolute;
      top: 0;
      right: 0;
      height: 100vh;
      background-color: #f8f9fa;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
      overflow: auto;
      transition: transform 0.3s ease-in-out;
    }
  `]
})
export class DrawerComponent {
  @Input() isOpen = false;
  @Input() minWidth: string = '250px';
  @Input() width: string = '300px'; // Можно переопределить по желанию
}
