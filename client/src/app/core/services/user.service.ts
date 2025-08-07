import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { UserStore } from '../../stores/user-store/user.store';
import { User } from '../types/user.model';


@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private api: BaseApiService,
    private store: UserStore
  ) {}

  loadUsers(): Observable<User[]> {
    this.store.setLoading(true);
    return this.api.get<User[]>('users').pipe(
      tap({
        next: (users) => {
          this.store.setUsers(users);
          this.store.setLoading(false);
        },
        error: (err) => {
          this.store.setError('Failed to load users');
          this.store.setLoading(false);
        }
      })
    );
  }

  loadUsersOnlyAdmins(): Observable<User[]> {
    this.store.setLoading(true);
    return this.api.get<User[]>('users').pipe(
      map(users => users.filter(user => user.role === 'admin')),
      tap({
        next: (admins) => {
          this.store.setAdminUsers(admins);
          this.store.setLoading(false);
        },
        error: (err) => {
          this.store.setError('Failed to load admins');
          this.store.setLoading(false);
        }
      }),
      catchError(err => {
        console.error('Error fetching admins:', err);
        return of([]);
      })
    );
  }

  getUserMe(): Observable<User> {
    this.store.setLoading(true);
    return this.api.get<User>('users/me').pipe(
      tap({
        next: (user) => {
          this.store.setCurrentUser(user);
          this.store.setLoading(false);
        },
        error: (err) => {
          this.store.setError('Failed to load user');
          this.store.setLoading(false);
        }
      })
    );
  }

  // getUser(id: number): Observable<User> {
  //   this.store.setLoading(true);
  //   return this.api.get<User>(`users/${id}`).pipe(
  //     tap({
  //       next: (user) => {
  //         this.store.setCurrentUser(user);
  //         this.store.setLoading(false);
  //       },
  //       error: (err) => {
  //         this.store.setError('Failed to load user');
  //         this.store.setLoading(false);
  //       }
  //     })
  //   );
  // }

  // createUser(userData: Omit<User, 'id'>): Observable<User> {
  //   this.store.setLoading(true);
  //   return this.api.post<User>('users', userData).pipe(
  //     tap({
  //       next: (user) => {
  //         this.store.addUser(user);
  //         this.store.setLoading(false);
  //       },
  //       error: (err) => {
  //         this.store.setError('Ошибка создания');
  //         this.store.setLoading(false);
  //       }
  //     })
  //   );
  // }

  updateUserMe(user: User): Observable<User> {
    this.store.setLoading(true);
    return this.api.put<User>(`users/${user.id}`, user).pipe(
      tap({
        next: (updatedUser) => {
          this.store.setCurrentUser(updatedUser);
          this.store.setLoading(false);
        },
        error: (err) => {
          this.store.setError('Ошибка редактирования');
          this.store.setLoading(false);
        }
      })
    );
  }

  // deleteUser(id: string): Observable<void> {
  //   this.store.setLoading(true);
  //   return this.api.delete<void>(`users/${id}`).pipe(
  //     tap({
  //       next: () => {
  //         this.store.deleteUser(id);
  //         this.store.setLoading(false);
  //       },
  //       error: (err) => {
  //         this.store.setError('Ошиюка удаления');
  //         this.store.setLoading(false);
  //       }
  //     })
  //   );
  // }
}
