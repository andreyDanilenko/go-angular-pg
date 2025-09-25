import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/challenger/components/header/header.component';
import { FooterComponent } from '../../components/challenger/components/footer/footer.component';
import { ChallengeDetailGeneral } from '../../components/challenger/types/сhallengeCatalogDetail';
import { ChallengeDetailCatalogMetaComponent } from '../../components/challenger/components/challenge-detail-catalog/challenge-detail-catalog-meta/challenge-detail-catalog-meta';
import { ChallengeDetailCatalogAboutComponent } from '../../components/challenger/components/challenge-detail-catalog/challenge-detail-catalog-about/challenge-detail-catalog-about';
import { ChallengeDetailCatalogScheduleComponent } from '../../components/challenger/components/challenge-detail-catalog/challenge-detail-catalog-schedule/challenge-detail-catalog-schedule';
import { ChallengeDetailCatalogIncreasesComponent } from '../../components/challenger/components/challenge-detail-catalog/challenge-detail-catalog-increases/challenge-detail-catalog-increases';
import { ChallengeDetailCatalogCorrectionComponent } from '../../components/challenger/components/challenge-detail-catalog/challenge-detail-catalog-correction/challenge-detail-catalog-correction';
import { ChallengeDetailCatalogInfoComponent } from '../../components/challenger/components/challenge-detail-catalog/challenge-detail-catalog-info/challenge-detail-catalog-info';
import { ChallengeDetailCatalogActionsComponent } from '../../components/challenger/components/challenge-detail-catalog/challenge-detail-catalog-actions/challenge-detail-catalog-actions';
import { challengeDetailMock } from '../../components/challenger/types/mocks';

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
    ChallengeDetailCatalogCorrectionComponent,
    ChallengeDetailCatalogInfoComponent,
    ChallengeDetailCatalogActionsComponent
  ],
  templateUrl: './challenge-detail-catalog-page.component.html',
  styleUrls: ['./challenge-detail-catalog-page.component.css']
})
export class ChallengeDetailCatalogPageComponent implements OnInit {
  challengeId!: string;
  challenge: ChallengeDetailGeneral | null = challengeDetailMock;
  isLoading = false;

  // Геттер для удобного доступа к actions данным
  get challengeActions() {
    return this.challenge?.challenge_actions || null;
  }

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.challengeId = this.route.snapshot.paramMap.get('id') || 'pushup-100-days';
    this.loadChallengeData(this.challengeId);
  }

  private loadChallengeData(id: string): void {
    // Здесь будет загрузка данных с API
    // Пока используем мок данные
    this.isLoading = true;

    // Имитация загрузки с API
    setTimeout(() => {
      // В реальном приложении здесь будет подстановка данных по ID
      if (id === 'pushup-100-days') {
        this.challenge = challengeDetailMock;
      }
      this.isLoading = false;
    }, 500);
  }

  onJoinChallenge(challengeId: string): void {
    this.isLoading = true;

    // API call to join challenge
    setTimeout(() => {
      if (this.challenge && this.challenge.challenge_actions) {
        this.challenge.challenge_actions.isParticipating = true;
        this.challenge.challenge_actions.joinDate = new Date();
        this.challenge.challenge_actions.challengeStatus = 'active';
      }
      this.isLoading = false;
    }, 1000);
  }

  onToggleBookmark(event: { challengeId: string, isBookmarked: boolean }): void {
    this.isLoading = true;
    setTimeout(() => {
      if (this.challenge && this.challenge.challenge_actions) {
        this.challenge.challenge_actions.isBookmarked = event.isBookmarked;
      }
      this.isLoading = false;
    }, 500);
  }

  onLeaveChallenge(challengeId: string): void {
    this.isLoading = true;
    setTimeout(() => {
      if (this.challenge && this.challenge.challenge_actions) {
        this.challenge.challenge_actions.isParticipating = false;
        this.challenge.challenge_actions.joinDate = undefined;
        this.challenge.challenge_actions.challengeStatus = 'upcoming';
      }
      this.isLoading = false;
    }, 1000);
  }
}
