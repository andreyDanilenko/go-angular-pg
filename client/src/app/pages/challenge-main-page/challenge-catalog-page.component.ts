import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/challenger/components/header/header.component';
import { FooterComponent } from '../../components/challenger/components/footer/footer.component';

@Component({
  selector: 'app-challenge-main-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './challenge-catalog-page.component.html',
  styleUrls: ['./challenge-catalog-page.component.css']
})
export class ChallengeCatalogPageComponent {


}
