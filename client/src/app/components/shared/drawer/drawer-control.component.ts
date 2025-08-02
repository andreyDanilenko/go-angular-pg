import { Component } from '@angular/core';
import { DrawerService } from '../../../core/services/drawer.service';

@Component({
  selector: 'app-drawer-control',
  standalone: true,
  template: `
    <button (click)="open()">Open</button>
  `
})
export class DrawerControlComponent {
  constructor(public drawerService: DrawerService) {}

  open() {
    this.drawerService.open('Мой заголовок');
  }

  close() {
    this.drawerService.close();
  }

  toggle() {
    this.drawerService.toggle();
  }
}
