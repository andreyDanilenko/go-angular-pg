import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { Article } from '../../core/types/article.model';
import { TruncatePipe } from '../../core/services/truncate.pipe';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

@Component({
  selector: 'app-posts-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TruncatePipe
  ],
  templateUrl: './posts-page.html',
  styleUrls: ['./posts-page.scss'],

  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class PostsPageComponent implements OnInit {
  articles: Article[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private articleService: ArticleService) {}

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
}
