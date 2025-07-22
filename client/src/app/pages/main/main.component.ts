import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from '../../components/shared/chat.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ChatComponent], // <-- добавляем ChatComponent сюда
  template: `
    <h2>Добро пожаловать на главную страницу!</h2>
    <p>Вы успешно вошли в систему.</p>

    <!-- Вставляем чат -->
    <app-chat></app-chat>


    проввфыватфловтлфдывтыфждв
    адцавьлдывьалдвыьа
  `,
  styles: [`
    h2 {
      color: #4a90e2;
      border-bottom: 2px solid #4a90e2;
      padding-bottom: 0.5rem;
      border-radius: 4px;
    }
    p {
      font-size: 1.1rem;
      color: #555;
    }
  `]
})
export class HomeComponent {}
