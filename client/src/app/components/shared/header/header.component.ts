import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserStore } from '../../../stores/user-store/user.store';
import { User } from '../../../core/types/user.model';
import { DrawerComponent } from '../drawer/drawer.component';
import { ThemeToggleComponent } from '../uikit/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule, DrawerComponent, ThemeToggleComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  isDrawerOpen = false;

  constructor(private userStore: UserStore, private router: Router) {}

  ngOnInit(): void {
    this.userStore.state$.subscribe(state => {
      this.currentUser = state.currentUser;
    });
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  get displayName(): string {
    if (!this.currentUser) return '';
      const role = this.currentUser.role.toUpperCase()

    if (this.currentUser.username) return `${this.currentUser.username} ${role}`;
    if (this.currentUser.first_name && this.currentUser.last_name) {
      return `${this.currentUser.last_name} ${this.currentUser.first_name.charAt(0)}. ${role}`;
    }

    return `${this.currentUser.email} ${role}`;
  }
}
