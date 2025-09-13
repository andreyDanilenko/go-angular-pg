import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalConfig {
  content?: TemplateRef<any>;
  title?: string;
  data?: any;
  isHeader?: boolean;
}

interface ModalState {
  isOpen: boolean;
  config: ModalConfig | null;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modalState$ = new BehaviorSubject<ModalState>({
    isOpen: false,
    config: null
  });

  get state() {
    return this.modalState$.asObservable();
  }

  open(config: ModalConfig) {
    this.modalState$.next({ isOpen: true, config });
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modalState$.next({ isOpen: false, config: null });
    document.body.style.overflow = '';
  }
}
