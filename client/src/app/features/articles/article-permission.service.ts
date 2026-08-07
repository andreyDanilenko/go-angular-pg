import { Injectable } from '@angular/core';

import { Article } from '../../core/types/article.model';
import { User } from '../../core/types/user.model';

@Injectable({ providedIn: 'root' })
export class ArticlePermissionService {
  canManage(article: Article, user: User | null): boolean {
    return Boolean(user && (user.role === 'admin' || user.id === article.authorId));
  }
}
