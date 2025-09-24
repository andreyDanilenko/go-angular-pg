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

export const MOCK_CHALLENGE_META: ChallengeDetailCatalogMeta[] = [
  {
    id: '1',
    category: 'Фитнес',
    title: 'Фитнес 30 дней для начинающих',
    subtitle: 'Ежедневные тренировки по 30 минут, которые помогут вам начать путь к здоровому образу жизни и улучшить физическую форму',
    duration: '30 дней',
    timePerDay: '30 мин/день',
    difficulty: 'Для новичков',
    location: 'Домашние тренировки',
    categoryColor: '#4CAF50'
  },
  {
    id: '2',
    category: 'Йога',
    title: 'Утренняя йога на 21 день',
    subtitle: 'Начните свой день с энергии и гармонии через практику йоги',
    duration: '21 день',
    timePerDay: '20 мин/день',
    difficulty: 'Для всех уровней',
    location: 'Домашние занятия',
    categoryColor: '#2196F3'
  },
  {
    id: '3',
    category: 'Питание',
    title: 'Здоровое питание за 14 дней',
    subtitle: 'Изменение пищевых привычек для улучшения здоровья и самочувствия',
    duration: '14 дней',
    timePerDay: '15 мин/день',
    difficulty: 'Для начинающих',
    location: 'На кухне',
    categoryColor: '#FF9800'
  }
];

export const MOCK_CHALLENGE_META_ITEMS = [
  { icon: '📅', text: 'duration' },
  { icon: '⏰', text: 'timePerDay' },
  { icon: '💪', text: 'difficulty' },
  { icon: '🏠', text: 'location' }
];

export const MOCK_CHALLENGE_ABOUT: ChallengeDetailCatalogAbout[] = [
  {
    id: '1',
    title: 'О челлендже',
    description: 'Этот 30-дневный фитнес-челлендж специально разработан для тех, кто только начинает свой путь в мире фитнеса. Программа построена по принципу постепенного увеличения нагрузки, что позволяет телу адаптироваться без риска травм. Каждый день вы будете выполнять короткие, но эффективные тренировки продолжительностью 30 минут, которые можно проводить дома без специального оборудования.',
    goals: [
      'Укрепить основные группы мышц',
      'Развить выносливость',
      'Улучшить осанку и гибкость',
      'Сформировать привычку регулярных тренировок'
    ],
    requirements: [
      'Коврик для фитнеса',
      'Удобная спортивная одежда',
      'Бутылка воды',
      'Положительный настрой'
    ],
    benefits: [
      'Улучшение физической формы',
      'Повышение энергии в течение дня',
      'Улучшение качества сна',
      'Снижение уровня стресса'
    ]
  },
  {
    id: '2',
    title: 'О программе йоги',
    description: '21-дневная программа утренней йоги поможет вам пробудиться с энергией и гармонией. Каждое утро начинайте с последовательности асан, которые пробудят ваше тело и подготовят разум к новому дню.',
    goals: [
      'Развить гибкость тела',
      'Улучшить концентрацию',
      'Научиться управлять дыханием',
      'Снять мышечное напряжение'
    ],
    requirements: [
      'Йога-мат',
      'Свободная одежда',
      'Тихое пространство',
      'Открытость к новым ощущениям'
    ],
    benefits: [
      'Улучшение гибкости и баланса',
      'Снижение тревожности',
      'Улучшение осанки',
      'Повышение ментальной ясности'
    ]
  },
  {
    id: '3',
    title: 'О питании',
    description: '14-дневная программа здорового питания научит вас основам правильного питания и поможет изменить пищевые привычки для долгосрочного здоровья и благополучия.',
    goals: [
      'Научиться выбирать полезные продукты',
      'Сбалансировать рацион',
      'Научиться готовить здоровые блюда',
      'Понять принципы питания'
    ],
    requirements: [
      'Кухонные принадлежности',
      'Журнал питания',
      'Весы для продуктов',
      'Готовность к изменениям'
    ],
    benefits: [
      'Улучшение пищеварения',
      'Нормализация веса',
      'Улучшение состояния кожи',
      'Повышение энергии'
    ]
  }
];

export const MOCK_CHALLENGE_SCHEDULE: ChallengeDetailCatalogSchedule[] = [
  {
    id: '1',
    weeks: [
      {
        weekNumber: '1',
        title: 'Неделя 1',
        subtitle: 'Адаптация',
        workoutType: 'Базовые упражнения',
        exercises: 'Приседания, отжимания на коленях, планка, мостик, шаги с прыжком',
        difficulty: 'beginner',
        progressPercentage: 20
      },
      {
        weekNumber: '2',
        title: 'Неделя 2',
        subtitle: 'Укрепление',
        workoutType: 'Круговые тренировки',
        exercises: 'Приседания с весом тела, классические отжимания, планка с подъемами, выпады, скручивания',
        difficulty: 'beginner-plus',
        progressPercentage: 40
      },
      {
        weekNumber: '3',
        title: 'Неделя 3',
        subtitle: 'Интенсивность',
        workoutType: 'HIIT (интервальные)',
        exercises: 'Бёрпи, прыжки со скакалкой, планка с перемещением, альпинист, приседания с прыжком',
        difficulty: 'intermediate',
        progressPercentage: 70
      },
      {
        weekNumber: '4',
        title: 'Неделя 4',
        subtitle: 'Пиковая форма',
        workoutType: 'Комплексные комплексы',
        exercises: 'Цепочки из нескольких упражнений, круговые тренировки с минимальным отдыхом, функциональные движения',
        difficulty: 'intermediate-plus',
        progressPercentage: 100
      }
    ]
  },
  {
    id: '2',
    weeks: [
      {
        weekNumber: '1',
        title: 'Неделя 1',
        subtitle: 'Основы йоги',
        workoutType: 'Хатха йога',
        exercises: 'Позы горы, дерева, воина, собаки мордой вниз, ребенка',
        difficulty: 'beginner',
        progressPercentage: 25
      },
      {
        weekNumber: '2',
        title: 'Неделя 2',
        subtitle: 'Гибкость',
        workoutType: 'Виньяса флоу',
        exercises: 'Приветствие солнцу, поза голубя, наклоны вперед, скручивания',
        difficulty: 'beginner-plus',
        progressPercentage: 50
      },
      {
        weekNumber: '3',
        title: 'Неделя 3',
        subtitle: 'Баланс',
        workoutType: 'Балансовые асаны',
        exercises: 'Поза орла, поза танцора, поза ворона, стойка на руках',
        difficulty: 'intermediate',
        progressPercentage: 75
      }
    ]
  }
];


export const MOCK_CHALLENGE_INCREASES: ChallengeDetailCatalogIncreases[] = [
  {
    id: '1',
    title: 'Как увеличивается нагрузка',
    subtitle: 'Постепенное увеличение нагрузки для безопасного прогресса',
    principles: [
      {
        icon: '📈',
        title: 'Объем',
        description: 'Количество подходов и повторений постепенно увеличивается от недели к неделе',
        details: [
          'Неделя 1: 2 подхода по 10-12 повторений',
          'Неделя 2: 3 подхода по 12-15 повторений',
          'Неделя 3: 4 подхода по 15-20 повторений',
          'Неделя 4: 5 подходов до мышечного отказа'
        ]
      },
      {
        icon: '⚡',
        title: 'Интенсивность',
        description: 'Время выполнения упражнений и минимальное время отдыха между ними увеличивается',
        details: [
          'Отдых: с 60 секунд до 30 секунд',
          'Темп: от медленного до быстрого выполнения',
          'Плотность: больше работы за меньшее время'
        ]
      },
      {
        icon: '🎯',
        title: 'Сложность',
        description: 'Базовые упражнения заменяются на более сложные варианты с большей амплитудой движения',
        details: [
          'От приседаний к приседаниям с прыжком',
          'От отжиманий на коленях к классическим отжиманиям',
          'От планки на локтях к планке с касанием плеч'
        ]
      },
      {
        icon: '🔄',
        title: 'Частота',
        description: 'По мере адаптации организма, количество тренировочных дней в неделю может увеличиваться',
        details: [
          'Начало: 3 тренировки в неделю',
          'Прогресс: 4-5 тренировок в неделю',
          'Пик: 6 тренировок с активным восстановлением'
        ]
      },
      {
        icon: '🎪',
        title: 'Вариативность',
        description: 'Добавляются новые упражнения для работы разных групп мышц и предотвращения адаптации',
        details: [
          'Новые углы нагрузки',
          'Разные типы мышечного сокращения',
          'Комбинированные движения'
        ]
      }
    ],
    recommendations: [
      'Слушайте свое тело и не увеличивайте нагрузку слишком быстро',
      'Соблюдайте правильную технику выполнения упражнений',
      'Не пропускайте разминку и заминку',
      'Следите за питанием и восстановлением'
    ]
  },
  {
    id: '2',
    title: 'Прогрессия в йоге',
    subtitle: 'Постепенное углубление практики',
    principles: [
      {
        icon: '🧘',
        title: 'Длительность асан',
        description: 'Увеличение времени удержания каждой позы',
        details: ['От 3 дыханий до 10-15 дыханий']
      },
      {
        icon: '🌀',
        title: 'Сложность поз',
        description: 'Переход от базовых асан к более сложным вариациям'
      },
      {
        icon: '💫',
        title: 'Последовательности',
        description: 'Усложнение виньяс и связок между асанами'
      }
    ]
  }
];
