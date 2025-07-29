import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from './core/services/user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: `:host { display: block; height: 100%; }`
})
export class App {
  protected readonly title = signal('client');

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getUserMe().subscribe();
  }
}
