import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserStore } from '../../../stores/user-store/user.store';
import { User } from '../../../core/types/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private userStore: UserStore) {}

  ngOnInit(): void {
    this.userStore.state$.subscribe(state => {
      this.currentUser = state.currentUser;
    });
  }

  get displayName(): string {
    if (!this.currentUser) return '';

    if (this.currentUser.username) return `${this.currentUser.username} ${this.currentUser.role.toUpperCase()}`;
    if (this.currentUser.firstName && this.currentUser.lastName) {
      return `${this.currentUser.lastName} ${this.currentUser.firstName.charAt(0)}. ${this.currentUser.role}`;
    }

    return `${this.currentUser.email} ${this.currentUser.role.toUpperCase()}`;
  }
}
