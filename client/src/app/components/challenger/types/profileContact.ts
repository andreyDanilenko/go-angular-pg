export interface ProfileContact {
  id: number;
  type: 'email' | 'phone' | 'telegram' | 'instagram' | 'website';
  value: string;
  label?: string;
}

export const MOCK_CONTACTS: ProfileContact[] = [
  {
    id: 1,
    type: 'email',
    value: 'alex.petrov@example.com',
    label: 'Рабочая почта'
  },
  {
    id: 2,
    type: 'phone',
    value: '+7 (999) 123-45-67',
    label: 'Мобильный'
  },
  {
    id: 3,
    type: 'telegram',
    value: '@alex_petrov',
    label: 'Telegram'
  },
  {
    id: 4,
    type: 'instagram',
    value: '@alex_fitness',
    label: 'Фитнес блог'
  },
  {
    id: 5,
    type: 'website',
    value: 'petrov-portfolio.ru',
    label: 'Портфолио'
  }
];
