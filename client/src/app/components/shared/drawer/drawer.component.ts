import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('openClose', [
      state('open', style({ transform: 'translateX(0)' })),
      state('closed', style({ transform: 'translateX(-100%)', opacity: '0', visibility: 'hidden' })), // Drawer закрыт
      transition('open <=> closed', animate('300ms ease-in-out')),
    ]),
  ],
  template: `
    <div
      class="overlay"
      *ngIf="isOpen"
      (click)="overlayClick.emit()"
    ></div>

    <div
      class="drawer"
      [@openClose]="isOpen ? 'open' : 'closed'"
      [ngStyle]="{ 'min-width': minWidth, 'width': maxwidth }"
    >
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 99;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.4);
    }

    .drawer {
      position: fixed;
      z-index: 100;
      top: 0;
      left: 0;
      height: 100vh;
      background-color: #f8f9fa;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
      overflow: auto;
    }
  `]
})
export class DrawerComponent {
  @Input() isOpen = true;
  @Input() minWidth: string = '250px';
  @Input() maxwidth: string = '400px';

  @Output() overlayClick = new EventEmitter<void>();
}
