import { Component, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserStore } from '../../../stores/user-store/user.store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../../core/types/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, AsyncPipe, NgIf],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  currentUser$: Observable<User | null>;
  displayName$: Observable<string>;

  constructor(private userStore: UserStore) {
    this.currentUser$ = this.userStore.state$.pipe(
      map(state => state.currentUser)
    );

    this.displayName$ = this.currentUser$.pipe(
      map(user => this.getDisplayName(user))
    );
  }

  private getDisplayName(user: User | null): string {
    if (!user) return '';

    if (user.username) return `${user.username} ${user.role.toUpperCase()}`;
    if (user.firstName && user.lastName) {
      return `${user.lastName} ${user.firstName.charAt(0)}. ${user.role}`;
    }

    return `${user.email} ${user.role.toUpperCase()}`;
  }
}
