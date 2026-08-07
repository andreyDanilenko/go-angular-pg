import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Article, ArticleInput } from '../../../core/types/article.model';
import { AlertComponent } from '../../../shared/ui/alert/alert.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { TextareaComponent } from '../../../shared/ui/textarea/textarea.component';

@Component({
  selector: 'app-article-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AlertComponent,
    ButtonComponent,
    InputComponent,
    TextareaComponent,
  ],
  templateUrl: './article-form.component.html',
  styleUrl: './article-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleFormComponent implements OnChanges {
  @Input() article: Article | null = null;
  @Input() isSubmitting = false;
  @Input() errorMessage = '';
  @Output() readonly submitted = new EventEmitter<ArticleInput>();
  @Output() readonly cancelled = new EventEmitter<void>();

  readonly form;

  constructor(formBuilder: NonNullableFormBuilder) {
    this.form = formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(50000)]],
      category: formBuilder.control<ArticleInput['category']>('general', Validators.required),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['article'] && this.article) {
      this.form.setValue({
        title: this.article.title,
        content: this.article.content,
        category: this.article.category,
      });
    }
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
  }
}
