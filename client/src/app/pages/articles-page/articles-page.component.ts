import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleListComponent } from '../../components/articles/articles-list/article-list.component';
import { Article } from '../../core/types/article.model';
import { ArticleService } from '../../core/services/article.service';
import { Router } from '@angular/router';
import { ArticlesHeaderHeaderComponent } from '../../components/articles/articles-list-header/articles-list-header.component';
import { ModalService } from '../../core/services/modal.service';
import { ModalComponent } from '../../components/shared/modal/modal.component';
import { CreateContentComponent } from '../../components/modalContents/create-content-modal/create-content-modal.component';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, ArticleListComponent, ArticlesHeaderHeaderComponent, ModalComponent, CreateContentComponent],
  templateUrl: './articles-page.component.html',
  styleUrls: ['./articles-page.component.css'],
  styles: []
})
export class ArticlesPageComponent {
  articles: Article[] = [];
  isLoading = true;
  error: string | null = null;

  @ViewChild('modalCreateContent') modalCreateContent!: TemplateRef<any>;

  constructor(private articleService: ArticleService, private router: Router, private modalService: ModalService) {}

  openModal() {
    this.modalService.open({
      content: this.modalCreateContent,
      title: 'Что вы хотите создать?'
    });
  }

  handleContentSelection = (type: 'post' | 'article') => {
    console.log('Выбран тип:', type);
    this.modalService.close();
    if (type === 'post') {
      this.router.navigate(['/create/post']);
    } else {
      this.router.navigate(['/create/article']);
    }
  }

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
