import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';

import { ArticleListComponent } from '../../components/articles/articles-list/article-list.component';
import {
  ArticleSort,
  ArticlesListHeaderComponent,
} from '../../components/articles/articles-list-header/articles-list-header.component';
import { getApiErrorMessage } from '../../core/api/api-error';
import { Article } from '../../core/types/article.model';
import { ArticleApi } from '../../features/articles/data-access/article-api.service';
import { AlertComponent } from '../../shared/ui/alert/alert.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [
    ArticleListComponent,
    ArticlesListHeaderComponent,
    AlertComponent,
    SpinnerComponent,
  ],
  templateUrl: './articles-page.component.html',
  styleUrl: './articles-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlesPageComponent implements OnInit {
  private readonly articleApi = inject(ArticleApi);
  private readonly articles = signal<readonly Article[]>([]);

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly query = signal('');
  readonly sort = signal<ArticleSort>('newest');
  readonly visibleArticles = computed(() => {
    const query = this.query().trim().toLocaleLowerCase('ru-RU');
    const filtered = query
      ? this.articles().filter((article) =>
          `${article.title} ${article.content} ${article.authorName}`
            .toLocaleLowerCase('ru-RU')
            .includes(query),
        )
      : [...this.articles()];

    return filtered.sort((left, right) => {
      if (this.sort() === 'title') {
        return left.title.localeCompare(right.title, 'ru-RU');
      }

      const difference = Date.parse(left.createdAt) - Date.parse(right.createdAt);
      return this.sort() === 'oldest' ? difference : -difference;
    });
  });

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.articleApi.getAll().subscribe({
      next: (articles) => {
        this.articles.set(articles);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(
          getApiErrorMessage(error, 'Не удалось загрузить посты.'),
        );
        this.isLoading.set(false);
      },
    });
  }
}
