import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/challenger/components/header/header.component';
import { FooterComponent } from '../../components/challenger/components/footer/footer.component';
import { ChallengeDetailCatalogMeta, MOCK_CHALLENGE_ABOUT, MOCK_CHALLENGE_META } from '../../components/challenger/types/сhallengeCatalogDetail';
import { ChallengeDetailCatalogMetaComponent } from '../../components/challenger/components/challenge-detail-catalog/challenge-detail-catalog-meta/challenge-detail-catalog-meta';
import { ChallengeDetailCatalogAboutComponent } from '../../components/challenger/components/challenge-detail-catalog/challenge-detail-catalog-about/challenge-detail-catalog-about';


@Component({
  selector: 'app-challenge-detail-catalog-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    ChallengeDetailCatalogMetaComponent,
    ChallengeDetailCatalogAboutComponent
  ],
  templateUrl: './challenge-detail-catalog-page.component.html',
  styleUrls: ['./challenge-detail-catalog-page.component.css']
})

export class ChallengeDetailCatalogPageComponent implements OnInit {
  challengeId!: string;
  challengeMetaData!: ChallengeDetailCatalogMeta | null;

  challengeAboutData = MOCK_CHALLENGE_ABOUT[0]

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.challengeId = this.route.snapshot.paramMap.get('id') || '1';
    this.loadChallengeData(this.challengeId);
  }

  private loadChallengeData(id: string): void {
    this.challengeMetaData = MOCK_CHALLENGE_META.find(challenge => challenge.id === id) || null;

    if (!this.challengeMetaData) {
      this.challengeMetaData = this.getNotFoundChallengeData(id);
    }
  }

  private getNotFoundChallengeData(id: string): ChallengeDetailCatalogMeta {
    return {
      id: id,
      category: 'Не найдено',
      title: 'Челлендж не найден',
      subtitle: 'Запрошенный челлендж не существует',
      duration: '0 дней',
      timePerDay: '0 мин/день',
      difficulty: 'Неизвестно',
      location: 'Неизвестно'
    };
  }
}
