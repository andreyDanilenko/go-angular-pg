export type ProfileChallengeInfo = {
  id: number;
  image: string;
  title: string;
  status: 'completed' | 'active' | 'planned';
  progress: number;
  startDate: string;
  endDate: string;
  category: string;
}

export const MOCK_CHALLENGES: ProfileChallengeInfo[] = [
  {
    id: 1,
    image: 'https://placehold.co/300x180/4a6fa5/ffffff?text=Фитнес+30+дней',
    title: 'Фитнес 30 дней',
    status: 'completed',
    progress: 100,
    startDate: '15 мар',
    endDate: '14 апр',
    category: 'fitness'
  },
  {
    id: 2,
    image: 'https://placehold.co/300x180/6a4fa5/ffffff?text=Чтение+книг',
    title: 'Чтение книг',
    status: 'active',
    progress: 65,
    startDate: '1 апр',
    endDate: '30 апр',
    category: 'education'
  },
  {
    id: 3,
    image: 'https://placehold.co/300x180/4fa56a/ffffff?text=Медитация',
    title: 'Медитация 21 день',
    status: 'planned',
    progress: 0,
    startDate: '1 мая',
    endDate: '21 мая',
    category: 'mindfulness'
  },
  {
    id: 4,
    image: 'https://placehold.co/300x180/a54f6a/ffffff?text=Изучение+Angular',
    title: 'Изучение Angular',
    status: 'active',
    progress: 40,
    startDate: '10 апр',
    endDate: '10 июн',
    category: 'programming'
  }
];
