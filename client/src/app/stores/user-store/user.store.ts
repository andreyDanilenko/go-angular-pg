import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserState } from './user.store.type';
import { User } from '../../core/types/user.model';

@Injectable({ providedIn: 'root' })
export class UserStore {
  private initialState: UserState = {
    users: [],
    adminUsers: [],
    currentUser: null,
    loading: false,
    error: null
  };

  private stateSubject = new BehaviorSubject<UserState>(this.initialState);
  public state$: Observable<UserState> = this.stateSubject.asObservable();

  get state(): UserState {
    return this.stateSubject.getValue();
  }

  setState(newState: Partial<UserState>): void {
    this.stateSubject.next({
      ...this.state,
      ...newState
    });
  }

  setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  setUsers(users: User[]): void {
    this.setState({ users, error: null });
  }

  setAdminUsers(adminUsers: User[]): void {
    this.setState({ adminUsers, error: null });
  }

  setCurrentUser(user: User): void {
    this.setState({ currentUser: user });
  }

  setError(error: string): void {
    this.setState({ error });
  }

  addUser(user: User): void {
    this.setState({ users: [...this.state.users, user] });
  }

  updateUser(updatedUser: User): void {
    const users = this.state.users.map(user =>
      user.id === updatedUser.id ? updatedUser : user
    );
    this.setState({ users });
  }

  deleteUser(userId: string): void {
    const users = this.state.users.filter(user => user.id !== userId);
    this.setState({ users });
  }

  reset(): void {
    this.stateSubject.next(this.initialState);
  }
}
