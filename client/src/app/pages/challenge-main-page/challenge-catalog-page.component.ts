import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/challenger/components/header/header.component';
import { FooterComponent } from '../../components/challenger/components/footer/footer.component';
import { ChallengeGeneral, MOCK_GENERAL_CHALLENGES } from '../../components/challenger/types/challengeGeneral';
import { ChallengeCardGeneralComponent } from '../../components/challenger/components/challenge-card-general/challenge-card-general.component';

@Component({
  selector: 'app-challenge-main-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    ChallengeCardGeneralComponent
  ],
  templateUrl: './challenge-catalog-page.component.html',
  styleUrls: ['./challenge-catalog-page.component.css']
})
export class ChallengeCatalogPageComponent {
  challenges: ChallengeGeneral[] = MOCK_GENERAL_CHALLENGES;
  onChallengeClick(challengeId: number): void {
    console.log('Clicked challenge:', challengeId);
  }

  onImageError(error: string): void {
    console.warn('Image error:', error);
  }
}
