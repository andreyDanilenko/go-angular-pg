import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleListComponent } from '../../components/articles/article-list/article-list.component';
import { Article, ArticleCategory } from '../../core/types/article.model';
import { ArticleService } from '../../core/services/article.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ArticleListComponent],
  templateUrl: './articles-page.component.html',
  styleUrls: ['./articles-page.component.css'],
  styles: []
})
export class ArticlesPageComponent {
  articles: Article[] = [];
  isLoading = true;
  error: string | null = null;


  constructor(private articleService: ArticleService, private router: Router) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.isLoading = true;
    this.error = null;

    this.articleService.getAllArticles().subscribe({
      next: (articles) => {
        this.articles = articles;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Не удалось загрузить статьи';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  viewArticle(articleId: string) {
    this.router.navigate(['/posts', articleId]);
  }
}
