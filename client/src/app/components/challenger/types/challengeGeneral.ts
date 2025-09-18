// challenge-general.model.ts
export interface ChallengeGeneral {
  id: number;
  image: string;
  category: string;
  title: string;
  description: string;
  duration: number; // в днях
  level: 'beginner' | 'intermediate' | 'advanced';
  participants: number;
  isFeatured?: boolean;
  isNew?: boolean;
  startDate?: Date;
  tags?: string[];
}

export type ChallengeLevel = 'beginner' | 'intermediate' | 'advanced';

export const MOCK_GENERAL_CHALLENGES: ChallengeGeneral[] = [
  {
    id: 1,
    image: 'https://placehold.co/300x180/4a6fa5/ffffff?text=Фитнес+30+дней',
    category: 'Фитнес',
    title: 'Фитнес 30 дней для начинающих',
    description: 'Ежедневные тренировки по 30 минут, которые помогут вам начать путь к здоровому образу жизни и улучшить физическую форму.',
    duration: 30,
    level: 'beginner',
    participants: 1247,
    isNew: true
  },
  {
    id: 2,
    image: 'https://placehold.co/300x180/6a4fa5/ffffff?text=Йога+21+день',
    category: 'Йога',
    title: 'Йога для расслабления',
    description: '21 день практики йоги для снятия стресса и улучшения гибкости. Подходит для всех уровней.',
    duration: 21,
    level: 'intermediate',
    participants: 892,
    isFeatured: true
  },
  {
    id: 3,
    image: 'https://placehold.co/300x180/4fa56a/ffffff?text=Бег+марафон',
    category: 'Бег',
    title: 'Подготовка к марафону',
    description: '12-недельная программа подготовки к полумарафону. Интенсивные тренировки для продвинутых бегунов.',
    duration: 84,
    level: 'advanced',
    participants: 356,
    tags: ['марафон', 'бег', 'выносливость']
  },
  {
    id: 4,
    image: 'https://placehold.co/300x180/a54f6a/ffffff?text=Медитация',
    category: 'Медитация',
    title: 'Медитация для начинающих',
    description: '14 дней практики медитации для улучшения концентрации и снижения тревожности.',
    duration: 14,
    level: 'beginner',
    participants: 2105
  }
];
