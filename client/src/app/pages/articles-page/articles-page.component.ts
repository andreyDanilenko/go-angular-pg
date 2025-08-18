import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleListComponent } from '../../components/articles/articles-list/article-list.component';
import { Article } from '../../core/types/article.model';
import { ArticleService } from '../../core/services/article.service';
import { Router } from '@angular/router';
import { ArticlesHeaderHeaderComponent } from '../../components/articles/articles-list-header/articles-list-header.component';
import { ModalService } from '../../core/services/modal.service';
import { ModalComponent } from '../../components/shared/modal/modal.component';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, ArticleListComponent, ArticlesHeaderHeaderComponent, ModalComponent],
  templateUrl: './articles-page.component.html',
  styleUrls: ['./articles-page.component.css'],
  styles: []
})
export class ArticlesPageComponent {
  articles: Article[] = [];
  isLoading = true;
  error: string | null = null;

  @ViewChild('modal1Content') modal1Content!: TemplateRef<any>;
  @ViewChild('modal2Content') modal2Content!: TemplateRef<any>;

  constructor(private articleService: ArticleService, private router: Router, private modalService: ModalService) {}

  openModal() {
    this.modalService.open({
      content: this.modal1Content,
      title: 'Первое модальное окно'
    });
  }

  openModalWithData() {
    this.modalService.open({
      content: this.modal2Content,
      title: 'Окно с данными',
      data: { id: 123, name: 'Пример' }
    });
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
