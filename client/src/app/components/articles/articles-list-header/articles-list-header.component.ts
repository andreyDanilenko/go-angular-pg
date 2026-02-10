import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserStore } from '../../../stores/user-store/user.store';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-articles-list-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './articles-list-header.component.html',
  styleUrls: ['./articles-list-header.component.css']
})
export class ArticlesHeaderHeaderComponent {
  sortOptions = [
    { value: '', label: 'Сортировка' },
    { value: 'newest', label: 'Сначала новые' },
    { value: 'oldest', label: 'Сначала старые' },
    { value: 'popular', label: 'По популярности' }
  ];

  searchQuery: string = '';
  selectedSort: string = '';

  @Output() searchChanged = new EventEmitter<string>();
  @Output() sortChanged = new EventEmitter<string>();
  @Output() addArticle = new EventEmitter<void>();
  @Output() openFilters = new EventEmitter<void>();

  constructor(
    private userStore: UserStore,
    private permissionService: PermissionService
  ) {}

  get canCreate(): boolean {
    return this.permissionService.canCreateArticle(this.userStore.state.currentUser);
  }

  onSearchChange(): void {
    this.searchChanged.emit(this.searchQuery);
  }

  onSortChange(): void {
    this.sortChanged.emit(this.selectedSort);
  }

  onAddArticle(): void {
    this.addArticle.emit();
  }

  onOpenFilters(): void {
    this.openFilters.emit();
  }
}
