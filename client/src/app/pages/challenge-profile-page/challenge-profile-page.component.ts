import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Article, ArticleCategory } from '../../core/types/article.model';
import { ArticleService } from '../../core/services/article.service';
import { HeaderComponent } from '../../components/challenger/components/header/header.component';
import { ChallengeProfileBioComponent } from '../../components/challenger/components/profile-page/bio/bio.component';
import { ChallengeProfileStatsComponent } from '../../components/challenger/components/profile-page/stats/stats.component';
import { ChallengeProfileStats } from '../../components/challenger/types/stats';
import { ChallengeProfileInfo } from '../../components/challenger/types/profile';
import { ProfileChallengeCardProfile, MOCK_CHALLENGES } from '../../components/challenger/types/challengeProfile';
import { ChallengeCardComponent } from '../../components/challenger/components/challenge-card-profile/challenge-card-profile.component';
import { MOCK_CONTACTS, ProfileContact } from '../../components/challenger/types/profileContact';
import { ChallengeProfileContactComponent } from '../../components/challenger/components/profile-page/contact/contact.component';
import { FooterComponent } from '../../components/challenger/components/footer/footer.component';

@Component({
  selector: 'app-challenge-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ChallengeProfileBioComponent,
    ChallengeProfileStatsComponent,
    ChallengeCardComponent,
    ChallengeProfileContactComponent,
    FooterComponent,
  ],
  templateUrl: './challenge-profile-page.component.html',
  styleUrls: ['./challenge-profile-page.component.css']
})
export class ChallengeProfilePageComponent implements OnInit {
  article: Article | null = null;
  isLoading = true;
  error: string | null = null;

  challenges: ProfileChallengeCardProfile[] = MOCK_CHALLENGES;
  contacts: ProfileContact[] = MOCK_CONTACTS;
  userStats: ChallengeProfileStats = {
    completed: 24,
    active: 12,
    success: 89,
    streak: 147
  };
  userInfo: ChallengeProfileInfo  = {
    avatar: 'https://placehold.co/120x120',
    name: 'Андрей Даниленко',
    username: 'danilllenko',
    bio: 'Энтузиаст саморазвития и здорового образа жизни. Увлечен фитнесом, чтением и изучением новых навыков. Верю, что маленькие ежедневные усилия приводят к большим результатам. Присоединяйтесь ко мне в этом путешествии по улучшению себя!'
  };


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
