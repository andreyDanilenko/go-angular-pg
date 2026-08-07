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
import { Article, ArticleInput } from '../../core/types/article.model';
import { ArticleFormComponent } from '../../features/articles/article-form/article-form.component';
import { ArticlePermissionService } from '../../features/articles/article-permission.service';
import { ArticleApi } from '../../features/articles/data-access/article-api.service';
import { AlertComponent } from '../../shared/ui/alert/alert.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SpinnerComponent } from '../../shared/ui/spinner/spinner.component';

@Component({
  selector: 'app-article-edit',
  standalone: true,
  imports: [ArticleFormComponent, AlertComponent, ButtonComponent, SpinnerComponent],
  template: `
    <section class="layout-container article-editor-page">
      <header>
        <p>Публикации</p>
        <h1>Редактирование поста</h1>
      </header>

      @if (isLoading()) {
        <app-spinner label="Загружаем пост" />
      } @else if (loadError()) {
        <app-alert>{{ loadError() }}</app-alert>
        <app-button variant="secondary" (pressed)="backToArticles()">
          Вернуться к постам
        </app-button>
      } @else if (!canManage()) {
        <app-alert>Редактировать пост может только его автор или администратор.</app-alert>
        <app-button variant="secondary" (pressed)="backToArticle()">
          Открыть пост
        </app-button>
      } @else {
        <app-article-form
          [article]="article()"
          [isSubmitting]="isSubmitting()"
          [errorMessage]="saveError()"
          (submitted)="save($event)"
          (cancelled)="backToArticle()"
        />
      }
    </section>
  `,
  styleUrl: './article-editor-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articleApi = inject(ArticleApi);
  private readonly permissions = inject(ArticlePermissionService);
  private readonly session = inject(SessionService);
  private readonly articleId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly article = signal<Article | null>(null);
  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly loadError = signal('');
  readonly saveError = signal('');
  readonly canManage = computed(() => {
    const article = this.article();
    return article ? this.permissions.canManage(article, this.session.user()) : false;
  });

  ngOnInit(): void {
    if (!this.articleId) {
      this.loadError.set('Некорректный адрес поста.');
      this.isLoading.set(false);
      return;
    }

    this.articleApi.getById(this.articleId).subscribe({
      next: (article) => {
        this.article.set(article);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.loadError.set(getApiErrorMessage(error, 'Не удалось загрузить пост.'));
        this.isLoading.set(false);
      },
    });
  }

  save(input: ArticleInput): void {
    if (!this.canManage() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.saveError.set('');
    this.articleApi.update(this.articleId, input).subscribe({
      next: (article) => void this.router.navigate(['/articles', article.id]),
      error: (error: unknown) => {
        this.saveError.set(getApiErrorMessage(error, 'Не удалось сохранить пост.'));
        this.isSubmitting.set(false);
      },
    });
  }

  backToArticle(): void {
    void this.router.navigate(['/articles', this.articleId]);
  }

  backToArticles(): void {
    void this.router.navigate(['/articles']);
  }
}
