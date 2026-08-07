import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { getApiErrorMessage } from '../../core/api/api-error';
import { ArticleInput } from '../../core/types/article.model';
import { ArticleApi } from '../../features/articles/data-access/article-api.service';
import { ArticleFormComponent } from '../../features/articles/article-form/article-form.component';

@Component({
  selector: 'app-article-create',
  standalone: true,
  imports: [ArticleFormComponent],
  template: `
    <section class="layout-container article-editor-page">
      <header>
        <p>Публикации</p>
        <h1>Новый пост</h1>
      </header>
      <app-article-form
        [isSubmitting]="isSubmitting()"
        [errorMessage]="errorMessage()"
        (submitted)="create($event)"
        (cancelled)="cancel()"
      />
    </section>
  `,
  styleUrl: '../article-edit/article-editor-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleCreateComponent {
  private readonly articleApi = inject(ArticleApi);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  create(input: ArticleInput): void {
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.articleApi.create(input).subscribe({
      next: (article) => void this.router.navigate(['/articles', article.id]),
      error: (error: unknown) => {
        this.errorMessage.set(getApiErrorMessage(error, 'Не удалось создать пост.'));
        this.isSubmitting.set(false);
      },
    });
  }

  cancel(): void {
    void this.router.navigate(['/articles']);
  }
}
