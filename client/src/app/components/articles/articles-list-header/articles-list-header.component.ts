import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { ArticleCategory } from '../../../core/types/article.model';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

export type ArticleSort = 'newest' | 'oldest' | 'title';
export type ArticleCategoryFilter = 'all' | ArticleCategory;

@Component({
  selector: 'app-articles-list-header',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './articles-list-header.component.html',
  styleUrl: './articles-list-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlesListHeaderComponent {
  @Input() query = '';
  @Input() sort: ArticleSort = 'newest';
  @Input() category: ArticleCategoryFilter = 'all';
  @Output() readonly queryChange = new EventEmitter<string>();
  @Output() readonly sortChange = new EventEmitter<ArticleSort>();
  @Output() readonly categoryChange = new EventEmitter<ArticleCategoryFilter>();
  @Output() readonly createArticle = new EventEmitter<void>();

  updateQuery(event: Event): void {
    this.queryChange.emit((event.target as HTMLInputElement).value);
  }

  updateSort(event: Event): void {
    this.sortChange.emit((event.target as HTMLSelectElement).value as ArticleSort);
  }

  updateCategory(event: Event): void {
    this.categoryChange.emit(
      (event.target as HTMLSelectElement).value as ArticleCategoryFilter,
    );
  }
}
