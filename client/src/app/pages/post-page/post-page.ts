import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticleService } from '../../core/services/article.service';
import { Article } from '../../core/types/article.model';
import { CommonModule } from '@angular/common';

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
      // Режим редактирования существующего поста
      // this.isEditMode = true;
      this.loadPost(postId);
    } else {
      // Режим создания нового поста
      this.isEditMode = false;
    }
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
      // Обновляем пост
      this.articleService.updateArticle(this.article.id, postData).subscribe({
        next: () => {
          this.router.navigate(['/posts', this.article?.id]);
        },
        error: (err) => {
          this.error = 'Ошибка при обновлении';
          this.isLoading = false;
        }
      });
    } else {
      // Создаем новый пост
      this.articleService.createArticle(postData).subscribe({
        next: (newPost) => {
          this.router.navigate(['/posts', newPost.id]);
        },
        error: (err) => {
          this.error = 'Ошибка при создании';
          this.isLoading = false;
        }
      });
    }
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      // Выходим из режима редактирования
      this.postForm.reset(this.article);
      this.isEditMode = false;
    } else {
      // Входим в режим редактирования
      this.isEditMode = true;
    }
  }
}
