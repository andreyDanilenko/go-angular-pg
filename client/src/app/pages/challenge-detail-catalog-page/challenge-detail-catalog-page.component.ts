import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/challenger/components/header/header.component';
import { FooterComponent } from '../../components/challenger/components/footer/footer.component';


@Component({
  selector: 'app-challenge-detail-catalog-page',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './challenge-detail-catalog-page.component.html',
  styleUrls: ['./challenge-detail-catalog-page.component.css']
})
export class ChallengeDetailCatalogPageComponent implements OnInit {
  // challengeId: number;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Получение id из параметров маршрута
    const articleId = this.route.snapshot.paramMap.get('id');

    // Или для отслеживания изменений параметров:
    // this.route.paramMap.subscribe(params => {
    //   this.challengeId = +params.get('id');
    //   this.loadChallengeData(this.challengeId);
    // });
  }
}
