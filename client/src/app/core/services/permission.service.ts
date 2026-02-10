import { Injectable } from '@angular/core';
import { User } from '../types/user.model';
import { Article } from '../types/article.model';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  canCreateArticle(user: User | null): boolean {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'user';
  }

  canEditArticle(article: Article, user: User | null): boolean {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'user' && article.authorId === user.id) return true;
    return false;
  }

  canDeleteArticle(article: Article, user: User | null): boolean {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'user' && article.authorId === user.id) return true;
    return false;
  }
}
