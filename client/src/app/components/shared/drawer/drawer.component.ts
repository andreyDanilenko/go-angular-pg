import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerService } from '../../../core/services/drawer.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-drawer',
  template: `
    <div class="overlay" *ngIf="drawerService.isOpen$ | async" (click)="drawerService.close()">
      <div class="drawer" (click)="$event.stopPropagation()">
        <button (click)="drawerService.close()">Close</button>

        <h2>{{ drawerService.title$ | async }}</h2>
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
    }
    .drawer {
      position: fixed;
      right: 0;
      top: 0;
      width: 300px;
      height: 100%;
      background: white;
      padding: 20px;
      box-shadow: -2px 0 5px rgba(0,0,0,0.2);
    }
  `]
})
export class DrawerComponent {
  constructor(public drawerService: DrawerService) {}
}
