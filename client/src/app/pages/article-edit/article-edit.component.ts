import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { ArticleCategory, CATEGORY_LABELS, CreateArticleInput } from '../../core/types/article.model';
import { UserStore } from '../../stores/user-store/user.store';
import { PermissionService } from '../../core/services/permission.service';

@Component({
  selector: 'app-article-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.scss']
})
export class ArticleEditComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  isLoading = true;
  error: string | null = null;
  articleId: string | null = null;
  categories = Object.values(ArticleCategory);
  categoryLabels = CATEGORY_LABELS;

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private router: Router,
    private route: ActivatedRoute,
    private userStore: UserStore,
    private permissionService: PermissionService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(50000)]],
      category: [ArticleCategory.General],
    });
  }

  ngOnInit(): void {
    this.articleId = this.route.snapshot.paramMap.get('id');
    if (!this.articleId) {
      this.router.navigate(['/articles']);
      return;
    }
    this.articleService.getArticle(this.articleId).subscribe({
      next: (article) => {
        this.isLoading = false;
        if (!this.permissionService.canEditArticle(article, this.userStore.state.currentUser)) {
          this.router.navigate(['/articles', this.articleId]);
          return;
        }
        this.form.patchValue({
          title: article.title,
          content: article.content,
          category: article.category,
        });
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/articles']);
      },
    });
  }

  cancel() {
    this.router.navigate(['/articles', this.articleId]);
  }

  submit() {
    if (this.form.invalid || !this.articleId) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const payload: CreateArticleInput = {
      title: this.form.value.title,
      content: this.form.value.content,
      category: this.form.value.category,
    };

    this.articleService.updateArticle(this.articleId, payload).subscribe({
      next: (article) => {
        this.router.navigate(['/articles', article.id]);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = err.error?.message || 'Не удалось сохранить';
      },
    });
  }
}
