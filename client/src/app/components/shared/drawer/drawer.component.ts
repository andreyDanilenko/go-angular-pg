import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="overlay"
      [class.overlay_visible]="isOpen"
      (click)="overlayClick.emit()"
    ></div>
    <div
      class="drawer"
      [class.drawer_open]="isOpen"
    >
      <div class="drawer-header">
        <button class="btn-icon" (click)="overlayClick.emit()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
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
      background-color: rgba(0, 0, 0, 0.32);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }
    .overlay_visible {
      opacity: 1;
      pointer-events: auto;
    }
    .drawer {
      position: fixed;
      z-index: 100;
      top: 0;
      left: 0;
      height: 100vh;
      width: 100%;
      max-width: 320px;
      background-color: var(--md-sys-color-background);
      box-shadow: var(--shadow-md);
      overflow: auto;
      border-right: 1px solid var(--md-sys-color-outline-variant);
      display: flex;
      flex-direction: column;
      transform: translateX(-100%);
      transition: transform 0.25s ease;
    }
    .drawer_open {
      transform: translateX(0);
    }
    .drawer-header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      height: var(--app-height);
      padding: var(--space-2) var(--space-4);
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }
    @media (min-width: 768px) {
      .drawer {
        max-width: 360px;
      }
    }
  `]
})
export class DrawerComponent {
  @Input() isOpen = false;
  @Input() minWidth: string = '200px';
  @Input() maxwidth: string = '300px';

  @Output() overlayClick = new EventEmitter<void>();
}
