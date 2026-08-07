import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { getApiErrorMessage } from '../../core/api/api-error';
import { SessionService } from '../../core/session/session.service';
import {
  ARTICLE_CATEGORY_LABELS,
  Article,
  ArticleCategory,
} from '../../core/types/article.model';
import { ArticlePermissionService } from '../../features/articles/article-permission.service';
import { ArticleApi } from '../../features/articles/data-access/article-api.service';
import { AlertComponent } from '../../shared/ui/alert/alert.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-article-page',
  standalone: true,
  imports: [DatePipe, AlertComponent, ButtonComponent, SpinnerComponent],
  templateUrl: './article-page.component.html',
  styleUrl: './article-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articleApi = inject(ArticleApi);
  private readonly permissions = inject(ArticlePermissionService);
  private readonly session = inject(SessionService);
  private readonly articleId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly article = signal<Article | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly isConfirmingDelete = signal(false);
  readonly isDeleting = signal(false);
  readonly canManage = computed(() => {
    const article = this.article();
    return article ? this.permissions.canManage(article, this.session.user()) : false;
  });

  ngOnInit(): void {
    if (!this.articleId) {
      this.errorMessage.set('Некорректный адрес поста.');
      this.isLoading.set(false);
      return;
    }

    this.articleApi.getById(this.articleId).subscribe({
      next: (article) => {
        this.article.set(article);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(getApiErrorMessage(error, 'Не удалось загрузить пост.'));
        this.isLoading.set(false);
      },
    });
  }

  categoryLabel(category: ArticleCategory): string {
    return ARTICLE_CATEGORY_LABELS[category];
  }

  edit(): void {
    if (this.canManage()) {
      void this.router.navigate(['/articles', this.articleId, 'edit']);
    }
  }

  requestDelete(): void {
    if (this.canManage()) {
      this.isConfirmingDelete.set(true);
    }
  }

  cancelDelete(): void {
    this.isConfirmingDelete.set(false);
  }

  deleteArticle(): void {
    if (!this.canManage() || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.errorMessage.set('');
    this.articleApi.delete(this.articleId).subscribe({
      next: () => void this.router.navigate(['/articles']),
      error: (error: unknown) => {
        this.errorMessage.set(getApiErrorMessage(error, 'Не удалось удалить пост.'));
        this.isDeleting.set(false);
        this.isConfirmingDelete.set(false);
      },
    });
  }

  backToArticles(): void {
    void this.router.navigate(['/articles']);
  }
}
