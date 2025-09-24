import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/challenger/components/header/header.component';
import { FooterComponent } from '../../components/challenger/components/footer/footer.component';
import { ChallengeGeneral, MOCK_GENERAL_CHALLENGES } from '../../components/challenger/types/challengeGeneral';
import { ChallengeCardGeneralComponent } from '../../components/challenger/components/challenge-card-general/challenge-card-general.component';
import { ChallengePaginatorComponent } from '../../components/challenger/components/challenge-paginator/challenge-paginator';

@Component({
  selector: 'app-challenge-main-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    ChallengeCardGeneralComponent,
    ChallengePaginatorComponent
  ],
  templateUrl: './challenge-catalog-page.component.html',
  styleUrls: ['./challenge-catalog-page.component.css']
})
export class ChallengeCatalogPageComponent {
  // ChallengeCard
  challenges: ChallengeGeneral[] = MOCK_GENERAL_CHALLENGES;
  onChallengeClick(challengeId: number): void {
    console.log('Clicked challenge:', challengeId);
  }

  onImageError(error: string): void {
    console.warn('Image error:', error);
  }

  // Paginator
  paginationConfig = {
    currentPage: 1,
    totalItems: 150,
    itemsPerPage: 10,
    maxVisiblePages: 5
  };

  onPageChange(page: number): void {
    console.log('Переход на страницу:', page);
    this.paginationConfig = { ...this.paginationConfig, currentPage: page };

    // this.loadData(page);
  }
}
