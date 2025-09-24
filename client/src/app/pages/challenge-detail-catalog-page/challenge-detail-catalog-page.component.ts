import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/challenger/components/header/header.component';
import { FooterComponent } from '../../components/challenger/components/footer/footer.component';
import { ChallengeDetailCatalogAbout, ChallengeDetailCatalogCorrection, ChallengeDetailCatalogIncreases, ChallengeDetailCatalogMeta, ChallengeDetailCatalogSchedule, MOCK_CHALLENGE_ABOUT, MOCK_CHALLENGE_CORRECTION, MOCK_CHALLENGE_INCREASES, MOCK_CHALLENGE_META, MOCK_CHALLENGE_SCHEDULE } from '../../components/challenger/types/сhallengeCatalogDetail';
import { ChallengeDetailCatalogMetaComponent } from '../../components/challenger/components/challenge-detail-catalog/challenge-detail-catalog-meta/challenge-detail-catalog-meta';
import { ChallengeDetailCatalogAboutComponent } from '../../components/challenger/components/challenge-detail-catalog/challenge-detail-catalog-about/challenge-detail-catalog-about';
import { ChallengeDetailCatalogScheduleComponent } from '../../components/challenger/components/challenge-detail-catalog/challenge-detail-catalog-schedule/challenge-detail-catalog-schedule';
import { ChallengeDetailCatalogIncreasesComponent } from '../../components/challenger/components/challenge-detail-catalog/challenge-detail-catalog-increases/challenge-detail-catalog-increases';
import { ChallengeDetailCatalogCorrectionComponent } from '../../components/challenger/components/challenge-detail-catalog/challenge-detail-catalog-correction/challenge-detail-catalog-correction';

@Component({
  selector: 'app-challenge-detail-catalog-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    ChallengeDetailCatalogMetaComponent,
    ChallengeDetailCatalogAboutComponent,
    ChallengeDetailCatalogScheduleComponent,
    ChallengeDetailCatalogIncreasesComponent,
    ChallengeDetailCatalogCorrectionComponent
  ],
  templateUrl: './challenge-detail-catalog-page.component.html',
  styleUrls: ['./challenge-detail-catalog-page.component.css']
})

export class ChallengeDetailCatalogPageComponent implements OnInit {
  challengeId!: string;
  challengeMetaData: ChallengeDetailCatalogMeta | null = null;
  challengeAboutData: ChallengeDetailCatalogAbout | null = null;
  scheduleData: ChallengeDetailCatalogSchedule | null = null;
  increasesData: ChallengeDetailCatalogIncreases | null = null;
  correctionData: ChallengeDetailCatalogCorrection | null = null;


  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.challengeId = this.route.snapshot.paramMap.get('id') || '1';
    this.loadChallengeData(this.challengeId);
  }

  private loadChallengeData(id: string): void {
    this.challengeMetaData = MOCK_CHALLENGE_META.find(challenge => challenge.id === id) || null;
    this.challengeAboutData = MOCK_CHALLENGE_ABOUT.find(challenge => challenge.id === id) || null;
    this.scheduleData = MOCK_CHALLENGE_SCHEDULE.find(challenge => challenge.id === id) || null;
    this.increasesData = MOCK_CHALLENGE_INCREASES.find(challenge => challenge.id === id) || null;
    this.correctionData = MOCK_CHALLENGE_CORRECTION.find(challenge => challenge.id === id) || null;
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
