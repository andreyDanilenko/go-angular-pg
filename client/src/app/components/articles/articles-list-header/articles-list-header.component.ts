import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export type ArticleSort = 'newest' | 'oldest' | 'title';

@Component({
  selector: 'app-articles-list-header',
  standalone: true,
  templateUrl: './articles-list-header.component.html',
  styleUrl: './articles-list-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlesListHeaderComponent {
  @Input() query = '';
  @Input() sort: ArticleSort = 'newest';
  @Output() readonly queryChange = new EventEmitter<string>();
  @Output() readonly sortChange = new EventEmitter<ArticleSort>();

  updateQuery(event: Event): void {
    this.queryChange.emit((event.target as HTMLInputElement).value);
  }

  updateSort(event: Event): void {
    this.sortChange.emit((event.target as HTMLSelectElement).value as ArticleSort);
  }
}
