import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/api/api-client.service';
import { Article } from '../../../core/types/article.model';

@Injectable({ providedIn: 'root' })
export class ArticleApi {
  private readonly api = inject(ApiClient);

  getAll(): Observable<Article[]> {
    return this.api.get<Article[]>('articles/all');
  }
}
