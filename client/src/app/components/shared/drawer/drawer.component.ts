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
      state('closed', style({ transform: 'translateX(-100%)', opacity: '0', visibility: 'hidden' })),
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
      [ngStyle]="{ 'min-width': minWidth, 'max-width': maxwidth }"
    >
      <div class="drawer-header">
        <h3 class="drawer-title">Меню</h3>
        <button class="close-button" (click)="overlayClick.emit()">×</button>
      </div>
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
      width: 100%;
      top: 0;
      left: 0;
      height: 100vh;
      background-color: var(--md-sys-color-background);
      box-shadow: var(--shadow-md);
      overflow: auto;
      border-right: 1px solid var(--md-sys-color-outline-variant);
    }
    .drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }

    .drawer-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--md-sys-color-on-surface);
    }

    .close-button {
      background: transparent;
      border: none;
      padding: 8px;
      color: var(--md-sys-color-on-surface);
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
    }
  `]
})
export class DrawerComponent {
  @Input() isOpen = true;
  @Input() minWidth: string = '200px';
  @Input() maxwidth: string = '300px';

  @Output() overlayClick = new EventEmitter<void>();
}
