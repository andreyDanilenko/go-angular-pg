import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalConfig, ModalService } from '../../../core/services/modal.service';

interface ModalState {
  isOpen: boolean;
  config: ModalConfig | null;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" [class.active]="state.isOpen" (click)="onBackdropClick($event)">
      @if (state.config) {
        <div class="modal-content" role="dialog" aria-modal="true">
          @if (!state.config.isHeader) {
            <div class="modal-header">
              <h2 class="text-2xl modal-header-title">{{ state.config.title }}</h2>
              <button class="btn-icon" (click)="close()" aria-label="close modal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          }
          <div class="modal-body">
            <ng-container
              *ngTemplateOutlet="state.config.content; context: getTemplateContext()">
            </ng-container>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.25s ease, visibility 0.25s;
      z-index: 1000;
      pointer-events: none;
    }
    .modal-overlay.active {
      opacity: 1;
      visibility: visible;
      pointer-events: all;
    }
    .modal-content {
      background-color: var(--md-sys-color-background);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      transform: scale(0.9);
      transition: transform 0.25s ease;
      max-width: 90%;
      max-height: 90vh;
      overflow: auto;
      position: relative;
    }
    .modal-overlay.active .modal-content {
      transform: scale(1);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: var(--space-4);
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
    }
    .modal-header-title {
      color: var(--md-sys-color-on-surface);
    }
    .modal-body {
      padding: var(--space-4);
      min-height: 200px;
    }
  `]
})

export class ModalComponent {
  modalService = inject(ModalService);
  state: ModalState = { isOpen: false, config: null };

  constructor() {
    this.modalService.state.subscribe(state => {
      this.state = state;
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.state.isOpen) {
      this.close();
    }
  }

  close() {
    this.modalService.close();
  }

  onConfirm(result?: any) {
    // Логика подтверждения, если нужна
    this.close();
  }

  getTemplateContext() {
    return {
      $implicit: this.state.config?.data,
      close: () => this.close(),
      // Можно добавить другие методы
      onConfirm: (result?: any) => this.onConfirm(result)
    };
  }


  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
