import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router'; // Добавляем ActivatedRoute
import { Article } from '../../core/types/article.model';
import { ArticleService } from '../../core/services/article.service';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-page.component.html',
  styleUrls: ['./article-page.component.css']
})
export class ArticlePageComponent implements OnInit {
  article: Article | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute, // Добавляем ActivatedRoute
    private router: Router,
    private articleService: ArticleService // Предполагается, что у вас есть сервис для работы со статьями
  ) {}

  ngOnInit(): void {
    this.loadArticle();
  }

  private loadArticle(): void {
    // Получаем параметр id из маршрута
    const articleId = this.route.snapshot.paramMap.get('id');

    if (!articleId) {
      this.error = 'ID статьи не указан';
      this.isLoading = false;
      return;
    }

    // Загружаем статью через сервис
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

  // Дополнительные методы, если нужны
  goBack(): void {
    this.router.navigate(['/articles']);
  }
}
