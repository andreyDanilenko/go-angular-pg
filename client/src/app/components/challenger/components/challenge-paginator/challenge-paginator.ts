import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PaginationConfig {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  maxVisiblePages?: number;
}

@Component({
  selector: 'app-challenge-paginator',
  standalone: true,
  imports: [CommonModule],
  template: `
     @if (totalPages > 1) {
      <div class="pagination">
        <button
          class="page-btn"
          [class.disabled]="currentPage === 1"
          (click)="goToPage(currentPage - 1)"
          [disabled]="currentPage === 1">
          ← Назад
        </button>

        @for (page of visiblePages; track page) {
          <button
            class="page-btn"
            [class.active]="page === currentPage"
            (click)="goToPage(page)">
            {{ page }}
          </button>
        }

        <button
          class="page-btn"
          [class.disabled]="currentPage === totalPages"
          (click)="goToPage(currentPage + 1)"
          [disabled]="currentPage === totalPages">
          → Вперед
        </button>
      </div>
     }
  `,
  styles: [`
    .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        margin-top: 40px;
    }

    .page-btn {
        width: 40px;
        height: 40px;
        border: 1px solid var(--md-sys-color-outline-variant);
        background-color: var(--md-sys-color-surface);
        color: var(--md-sys-color-on-surface);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        font-size: 14px;
    }

    .page-btn:hover:not(.disabled):not(.active) {
        background-color: var(--md-sys-color-surface-variant);
    }

    .page-btn.active {
        background-color: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        border-color: var(--md-sys-color-primary);
    }

    .page-btn.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .page-btn:first-child,
    .page-btn:last-child {
        width: auto;
        padding: 0 12px;
    }
  `]
})
export class ChallengePaginatorComponent {
  @Input() set config(value: PaginationConfig) {
    this._config = { ...this.defaultConfig, ...value };
    this.updatePagination();
  }

  @Output() pageChange = new EventEmitter<number>();

  private _config!: PaginationConfig;
  private defaultConfig: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10,
    maxVisiblePages: 5
  };

  currentPage = 1;
  totalPages = 0;
  visiblePages: number[] = [];

  private updatePagination(): void {
    this.currentPage = this._config.currentPage;
    this.totalPages = Math.ceil(this._config.totalItems / this._config.itemsPerPage);
    this.calculateVisiblePages();
  }

  private calculateVisiblePages(): void {
    const maxVisible = this._config.maxVisiblePages || 5;
    const half = Math.floor(maxVisible / 2);

    let startPage = Math.max(1, this.currentPage - half);
    let endPage = Math.min(this.totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    this.visiblePages = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
