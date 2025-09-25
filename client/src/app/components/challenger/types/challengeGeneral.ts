// challenge-general.model.ts
export interface ChallengeGeneral {
  id: string;
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

export const challengesListMock: ChallengeGeneral[] = [
  {
    id: "pushup-100-days",
    image: "https://placehold.co/300x180/4a6fa5/ffffff?text=100+дней+отжиманий",
    category: "Фитнес",
    title: "100 дней отжиманий",
    description: "Постепенное увеличение количества отжиманий до 100 повторений в день",
    duration: 100,
    level: "intermediate",
    participants: 12450,
    isFeatured: true,
    isNew: false,
    startDate: new Date("2024-01-15"),
    tags: ["силовые", "домашние тренировки", "выносливость"]
  }
];
