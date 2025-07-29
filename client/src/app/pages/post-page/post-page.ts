import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticleService } from '../../core/services/article.service';
import { Article, ArticleCategory } from '../../core/types/article.model';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
    // TruncatePipe
  ],
  templateUrl: './post-page.html',
  styleUrls: ['./post-page.scss']
})
export class PostEditorComponent implements OnInit {
  postForm: FormGroup;
  article: Article | null = null;
  isEditMode = false;
  isLoading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private articleService: ArticleService
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      content: ['', Validators.required],
      category: ['']
    });
  }

  ngOnInit(): void {
    const postId = this.route.snapshot.paramMap.get('id');

    if (postId) {
      this.loadPost(postId);
    } else {
      this.isEditMode = false;
    }
  }

  categoryOptions = Object.keys(ArticleCategory).map(key => ({
    value: ArticleCategory[key as keyof typeof ArticleCategory],
    label: this.getCategoryLabel(ArticleCategory[key as keyof typeof ArticleCategory])
  }));

  private getCategoryLabel(category: ArticleCategory): string {
    const labels = {
      [ArticleCategory.General]: 'Общие',
      [ArticleCategory.Tech]: 'Технологии',
      [ArticleCategory.Science]: 'Наука',
      [ArticleCategory.Politics]: 'Политика',
      [ArticleCategory.Health]: 'Здоровье'
    };
    return labels[category];
  }

  loadPost(postId: string): void {
    this.isLoading = true;
    this.articleService.getArticle(postId).subscribe({
      next: (post) => {
        this.article = post;
        this.postForm.patchValue(post);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Не удалось загрузить пост';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.postForm.invalid) return;

    this.isLoading = true;
    const postData = this.postForm.value;

    if (this.isEditMode && this.article) {
      this.articleService.updateArticle(this.article.id, postData).pipe(
          finalize(() => {
            this.isLoading = false;
          })
      ).subscribe({
        next: (response) => {
          this.article = {...this.article, ...response}
          this.router.navigate(['/posts', this.article?.id]);
          this.isEditMode = false;
        },
        error: (err) => {
          this.error = err?.error.message ?? 'Ошибка при обновлении';
        },
      });
    } else {
      this.articleService.createArticle(postData).pipe(
          finalize(() => {
            this.isLoading = false;
          })
      ).subscribe({
        next: (newPost) => {
          this.router.navigate(['/posts', newPost.id]);
          this.isEditMode = false;
        },
        error: (err) => {
          this.error = err?.error.message ?? 'Ошибка при создании';
        }
      });
    }
  }

  deleteArticle() {
    if (!this.article) return;

    if (confirm('Вы уверены, что хотите удалить этот пост? Это действие нельзя отменить.')) {
      this.isLoading = true;
      this.articleService.deleteArticle(this.article.id).subscribe({
        next: () => {
          this.router.navigate(['/posts']);
        },
        error: (err) => {
          this.error =  err?.error.message ?? 'Ошибка при удалении поста';
          this.isLoading = false;
        }
      });
    }
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      this.postForm.reset(this.article);
      this.isEditMode = false;
    } else {
      this.isEditMode = true;
    }
  }
}
