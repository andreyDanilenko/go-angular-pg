import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { HttpClient } from '@angular/common/http';
import { Article, CreateArticleInput } from '../types/article.model';

@Injectable({ providedIn: 'root' })
export class ArticleService extends BaseApiService {
  private readonly articlesEndpoint = 'articles';

  constructor(http: HttpClient) {
    super(http);
  }

  getUserArticles(): Observable<Article[]> {
    return this.get<Article[]>(this.articlesEndpoint);
  }

  getAllArticles(): Observable<Article[]> {
    return this.get<Article[]>(`${this.articlesEndpoint}/all`);
  }

  getArticle(id: string): Observable<Article> {
    return this.get<Article>(`${this.articlesEndpoint}/${id}`);
  }

  createArticle(input: CreateArticleInput): Observable<Article> {
    return this.post<Article>(this.articlesEndpoint, input);
  }

  updateArticle(id: string, article: Partial<Article>): Observable<Article> {
    return this.put<Article>(`${this.articlesEndpoint}/${id}`, article);
  }

  deleteArticle(id: string): Observable<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`${this.articlesEndpoint}/${id}`);
  }
}
