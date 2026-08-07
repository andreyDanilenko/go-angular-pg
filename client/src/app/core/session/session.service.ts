import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { finalize, map, Observable, tap } from 'rxjs';

import { ApiClient } from '../api/api-client.service';
import { AuthService } from '../auth/auth.service';
import {
  mapUser,
  UpdateProfileInput,
  User,
  UserDto,
} from '../types/user.model';

type UpdateProfileDto = {
  username: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  bio: string;
};

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly api = inject(ApiClient);
  private readonly authService = inject(AuthService);
  private readonly currentUser = signal<User | null>(null);
  private readonly loading = signal(false);

  readonly user = this.currentUser.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly displayName = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return '';
    }

    return user.username || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
  });

  constructor() {
    effect(() => {
      if (!this.authService.isAuthenticated()) {
        this.currentUser.set(null);
      }
    });
  }

  load(): Observable<User> {
    this.loading.set(true);
    return this.api.get<UserDto>('users/me').pipe(
      map(mapUser),
      tap((user) => this.currentUser.set(user)),
      finalize(() => this.loading.set(false)),
    );
  }

  update(input: UpdateProfileInput): Observable<User> {
    const dto: UpdateProfileDto = {
      username: input.username,
      first_name: input.firstName,
      last_name: input.lastName,
      middle_name: input.middleName,
      bio: input.bio,
    };

    return this.api.put<UserDto, UpdateProfileDto>('users/me', dto).pipe(
      map(mapUser),
      tap((user) => this.currentUser.set(user)),
    );
  }
}
