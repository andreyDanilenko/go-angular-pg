import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/api/api-client.service';
import { Article, ArticleInput } from '../../../core/types/article.model';

@Injectable({ providedIn: 'root' })
export class ArticleApi {
  private readonly api = inject(ApiClient);

  getAll(): Observable<Article[]> {
    return this.api.get<Article[]>('articles/all');
  }

  getById(id: string): Observable<Article> {
    return this.api.get<Article>(`articles/${id}`);
  }

  getCurrentUserArticles(): Observable<Article[]> {
    return this.api.get<Article[]>('articles');
  }

  create(input: ArticleInput): Observable<Article> {
    return this.api.post<Article, ArticleInput>('articles', input);
  }

  update(id: string, input: ArticleInput): Observable<Article> {
    return this.api.put<Article, ArticleInput>(`articles/${id}`, input);
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`articles/${id}`);
  }
}
