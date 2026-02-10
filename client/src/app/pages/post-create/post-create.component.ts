import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { ArticleCategory, CATEGORY_LABELS, CreateArticleInput } from '../../core/types/article.model';

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss']
})
export class PostCreateComponent {
  form: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  categories = Object.values(ArticleCategory);
  categoryLabels = CATEGORY_LABELS;

  constructor(
    private fb: FormBuilder,
    private articleService: ArticleService,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      category: [ArticleCategory.General],
    });
  }

  cancel() {
    this.router.navigate(['/articles']);
  }

  submit() {
    if (this.form.invalid) {
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

    this.articleService.createArticle(payload).subscribe({
      next: (article) => {
        this.router.navigate(['/articles', article.id]);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = err.error?.message || 'Не удалось опубликовать пост';
      },
    });
  }
}

