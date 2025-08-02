import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DrawerService {
  // Приватные BehaviorSubject с чёткими типами
  private _isOpen$ = new BehaviorSubject<boolean>(false);
  private _title$ = new BehaviorSubject<string>('');

  // Публичные Observable
  isOpen$ = this._isOpen$.asObservable();
  title$ = this._title$.asObservable();

  // Методы
  open(title: string = ''): void {
    this._title$.next(title);
    this._isOpen$.next(true);
  }

  close(): void {
    this._isOpen$.next(false);
  }

  toggle(): void {
    this._isOpen$.next(!this._isOpen$.value);
  }

  // Для отладки
  get currentState(): { isOpen: boolean; title: string } {
    return {
      isOpen: this._isOpen$.value,
      title: this._title$.value
    };
  }
}
