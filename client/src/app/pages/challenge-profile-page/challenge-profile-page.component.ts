import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Article, ArticleCategory } from '../../core/types/article.model';
import { ArticleService } from '../../core/services/article.service';
import { HeaderComponent } from '../../components/challenger/header/header.component';

@Component({
  selector: 'app-challenge-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
  ],
  templateUrl: './challenge-profile-page.component.html',
  styleUrls: ['./challenge-profile-page.component.css']
})
export class ChallengeProfilePageComponent implements OnInit {
  article: Article | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService
  ) {}

  ngOnInit(): void {
  }

  private loadArticle(): void {
    const articleId = this.route.snapshot.paramMap.get('id');

    if (!articleId) {
      this.error = 'ID статьи не указан';
      this.isLoading = false;
      return;
    }

  this.articleService.getArticle(articleId).subscribe({
      next: (article) => {
        this.article = article;
        this.isLoading = false;
        this.error = null;
      },
      error: (err) => {
        this.error = 'Не удалось загрузить статью';
        this.isLoading = false;
        console.error('Ошибка загрузки статьи:', err);
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

  getCategoryClass(category: ArticleCategory): string {
    return `category-${category}`;
  }

  getCategoryTranslation(category: ArticleCategory): string {
    const translations: Record<ArticleCategory, string> = {
      [ArticleCategory.General]: 'Общее',
      [ArticleCategory.Tech]: 'Технологии',
      [ArticleCategory.Science]: 'Наука',
      [ArticleCategory.Politics]: 'Политика',
      [ArticleCategory.Health]: 'Здоровье'
    };

    return translations[category] || category;
  }

  goBack(): void {
    this.router.navigate(['/articles']);
  }
}
