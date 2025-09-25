// MOCK DATA для 4 челленджей

import { ChallengeDetailGeneral } from "./сhallengeCatalogDetail";


export const challengeDetailMock: ChallengeDetailGeneral = {
  challenge_meta: {
    id: "pushup-100-days",
    category: "Фитнес",
    title: "100 дней отжиманий",
    subtitle: "От нуля до 100 отжиманий в день",
    duration: "100 дней",
    timePerDay: "15-30 минут",
    difficulty: "Средний",
    location: "Домашние условия",
    categoryColor: "#FF6B35"
  },

  challenge_about: {
    id: "pushup-100-days-about",
    title: "О челлендже",
    description: "Постепенная программа увеличения количества отжиманий, разработанная для систематического развития силы грудных мышц, трицепсов и плечевого пояса. Программа подходит как для начинающих, так и для опытных спортсменов.",
    goals: [
      "Увеличить количество отжиманий до 100 в день",
      "Укрепить мышцы груди, плеч и рук",
      "Развить мышечную выносливость",
      "Сформировать привычку регулярных тренировок"
    ],
    requirements: [
      "Минимальный уровень физической подготовки",
      "Коврик для тренировок",
      "Таймер или секундомер",
      "Ежедневное выделение 15-30 минут"
    ],
    benefits: [
      "Улучшение физической формы",
      "Повышение выносливости",
      "Укрепление кора и осанки",
      "Ускорение метаболизма"
    ]
  },

  challenge_schedule: {
    id: "pushup-100-days-schedule",
    weeks: [
      {
        weekNumber: "1-2",
        title: "Базовый уровень",
        subtitle: "Освоение техники",
        workoutType: "Отжимания от колен",
        exercises: "3 подхода по 5-10 повторений",
        difficulty: "beginner",
        progressPercentage: 10
      },
      {
        weekNumber: "3-4",
        title: "Начальная нагрузка",
        subtitle: "Переход к классическим отжиманиям",
        workoutType: "Классические отжимания",
        exercises: "4 подхода по 10-15 повторений",
        difficulty: "beginner-plus",
        progressPercentage: 25
      },
      {
        weekNumber: "5-8",
        title: "Прогрессия",
        subtitle: "Увеличение объема",
        workoutType: "Классические отжимания",
        exercises: "5 подходов по 15-25 повторений",
        difficulty: "intermediate",
        progressPercentage: 50
      },
      {
        weekNumber: "9-12",
        title: "Интенсив",
        subtitle: "Работа на выносливость",
        workoutType: "Разные виды отжиманий",
        exercises: "6 подходов по 25-40 повторений",
        difficulty: "intermediate-plus",
        progressPercentage: 75
      },
      {
        weekNumber: "13-14",
        title: "Мастерство",
        subtitle: "Достижение цели",
        workoutType: "Комбинированные подходы",
        exercises: "10 подходов по 10 повторений или 4 подхода по 25",
        difficulty: "advanced",
        progressPercentage: 100
      }
    ]
  },

  challenge_increases: {
    id: "pushup-100-days-increases",
    title: "Принципы прогрессии",
    subtitle: "Как безопасно увеличивать нагрузку",
    principles: [
      {
        icon: "📈",
        title: "Постепенное увеличение",
        description: "Добавляйте по 1-2 повторения в подход каждые 2-3 дня",
        details: [
          "Не увеличивайте нагрузку более чем на 10% в неделю",
          "Слушайте свое тело - при болях уменьшите интенсивность"
        ]
      },
      {
        icon: "🔄",
        title: "Циклирование нагрузки",
        description: "Чередуйте тяжелые и легкие дни",
        details: [
          "3 дня тренировок → 1 день отдыха",
          "Раз в 4 недели - неделя сниженной нагрузки"
        ]
      },
      {
        icon: "⚡",
        title: "Качество важнее количества",
        description: "Следите за правильной техникой выполнения",
        details: [
          "Полная амплитуда движения",
          "Контролируемое опускание и мощное поднятие"
        ]
      }
    ],
    recommendations: [
      "Всегда делайте разминку перед тренировкой",
      "Соблюдайте правильное дыхание: вниз - вдох, вверх - выдох",
      "Не пропускайте дни отдыха - они crucial для роста мышц"
    ]
  },

  challenge_correction: {
    id: "pushup-100-days-correction",
    title: "Коррекция программы",
    subtitle: "Что делать если не получается",
    warningLevel: "medium",
    strategies: [
      {
        icon: "🔄",
        title: "Снижение интенсивности",
        description: "Временное уменьшение количества повторений",
        intensity: 2,
        conditions: ["Мышечная усталость", "Небольшие болевые ощущения"]
      },
      {
        icon: "⏸️",
        title: "Пауза в тренировках",
        description: "Полный отдых на 2-3 дня",
        intensity: 4,
        conditions: ["Сильная мышечная боль", "Воспаление суставов"]
      },
      {
        icon: "🏥",
        title: "Консультация специалиста",
        description: "Обращение к врачу или тренеру",
        intensity: 5,
        conditions: ["Острая боль", "Травма", "Потеря подвижности"]
      }
    ],
    recommendations: [
      {
        text: "При болях в запястьях используйте упоры для отжиманий",
        type: "tip"
      },
      {
        text: "Не тренируйтесь через сильную боль - это может привести к травме",
        type: "warning"
      },
      {
        text: "Регулярно делайте растяжку грудных мышц и плеч",
        type: "important"
      }
    ],
    emergencyActions: [
      {
        situation: "Резкая боль в плече или груди",
        action: "Немедленно прекратите тренировку и обратитесь к врачу",
        immediate: true
      },
      {
        situation: "Онемение в руках",
        action: "Прекратите тренировку, сделайте легкую растяжку",
        immediate: true
      }
    ]
  },

  challenge_info: {
    id: "pushup-100-days-info",
    title: "Статистика челленджа",
    stats: [
      {
        type: "duration",
        value: 100,
        label: "Длительность",
        icon: "📅",
        unit: "дней"
      },
      {
        type: "dailyTime",
        value: 20,
        label: "Время в день",
        icon: "⏱️",
        unit: "минут"
      },
      {
        type: "participants",
        value: 12450,
        label: "Участников",
        icon: "👥"
      },
      {
        type: "completionRate",
        value: 68,
        label: "Завершили челлендж",
        icon: "✅",
        unit: "%"
      },
      {
        type: "successRate",
        value: 92,
        label: "Довольны результатом",
        icon: "⭐",
        unit: "%"
      },
      {
        type: "practiceDays",
        value: 94,
        label: "Средняя активность",
        icon: "🔥",
        unit: "дней"
      }
    ],
    difficulty: {
      level: "intermediate",
      label: "Средний уровень",
      description: "Требует базовой физической подготовки и дисциплины"
    },
    progress: {
      percentage: 0,
      current: 0,
      total: 100,
      label: "Готов к старту"
    },
    participantsInfo: "Более 12 тысяч участников уже начали свой путь к 100 отжиманиям"
  },

  challenge_actions: {
    challengeId: "pushup-100-days",
    canJoin: true,
    isBookmarked: false,
    isParticipating: false,
    challengeStatus: "upcoming"
  }
};
