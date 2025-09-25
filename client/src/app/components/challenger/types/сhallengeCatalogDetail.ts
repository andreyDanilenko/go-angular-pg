//Meta
export interface ChallengeDetailCatalogMeta {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  duration: string;
  timePerDay: string;
  difficulty: string;
  location: string;
  categoryColor?: string;
}

export interface ChallengeMetaItem {
  icon: string;
  text: string;
}

//About
export interface ChallengeDetailCatalogAbout {
  id: string;
  title: string;
  description: string;
  goals?: string[];
  requirements?: string[];
  benefits?: string[];
}

//Schedule
export interface ChallengeDetailCatalogSchedule {
  id: string;
  weeks: ScheduleWeek[];
}

export interface ScheduleWeek {
  weekNumber: string;
  title: string;
  subtitle: string;
  workoutType: string;
  exercises: string;
  difficulty: ScheduleDifficulty;
  progressPercentage: number;
}

export type ScheduleDifficulty = 'beginner' | 'beginner-plus' | 'intermediate' | 'intermediate-plus' | 'advanced';

export interface DifficultyStyle {
  class: string;
  label: string;
}

//Increases
export interface ChallengeDetailCatalogIncreases {
  id: string;
  title: string;
  subtitle: string;
  principles: IncreasePrinciple[];
  recommendations?: string[];
}

export interface IncreasePrinciple {
  icon: string;
  title: string;
  description: string;
  details?: string[];
}

export interface Recommendation {
  text: string;
  important?: boolean;
}
//Correction
export interface ChallengeDetailCatalogCorrection {
  id: string;
  title: string;
  subtitle?: string;
  warningLevel: 'low' | 'medium' | 'high';
  strategies: CorrectionStrategy[];
  recommendations: CorrectionRecommendation[];
  emergencyActions?: EmergencyAction[];
}

export interface CorrectionStrategy {
  icon: string;
  title: string;
  description: string;
  intensity: number; // 1-5, где 1 - минимальная коррекция, 5 - максимальная
  conditions: string[];
}

export interface CorrectionRecommendation {
  text: string;
  type: 'warning' | 'tip' | 'important';
}

export interface EmergencyAction {
  situation: string;
  action: string;
  immediate: boolean;
}

//Info
export interface ChallengeDetailCatalogInfo {
  id: string;
  title: string;
  stats: ChallengeStat[];
  difficulty: ChallengeDifficulty;
  progress?: UserProgress;
  participantsInfo?: string;
}

export interface ChallengeStat {
  type: 'duration' | 'dailyTime' | 'participants' | 'completionRate' | 'successRate' | 'practiceDays';
  value: number;
  label: string;
  icon?: string;
  unit?: string;
}

export interface ChallengeDifficulty {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  label: string;
  description?: string;
}

export interface UserProgress {
  percentage: number;
  current: number;
  total: number;
  label: string;
}
//actions

export interface ChallengeActionsData {
  challengeId: string;
  canJoin: boolean;
  isBookmarked: boolean;
  isParticipating: boolean;
  challengeStatus: 'upcoming' | 'active' | 'completed' | 'cancelled';
  joinDate?: Date;
}


export interface ChallengeDetailGeneral {
  challenge_meta: ChallengeDetailCatalogMeta;
  challenge_about: ChallengeDetailCatalogAbout;
  challenge_schedule: ChallengeDetailCatalogSchedule;
  challenge_increases: ChallengeDetailCatalogIncreases;
  challenge_correction: ChallengeDetailCatalogCorrection;
  challenge_info: ChallengeDetailCatalogInfo;
  challenge_actions: ChallengeActionsData;
}
