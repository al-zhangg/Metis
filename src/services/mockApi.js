// Mock API service for Metis
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data
const mockHabits = [
  {
    id: 1,
    userId: 1,
    title: "Morning Meditation",
    description: "Find inner peace like the ancient philosophers",
    icon: "🧘‍♂️",
    status: "active",
    streak: 7,
    category: "Wisdom",
    goal: "Daily practice",
    completed: false
  },
  {
    id: 2,
    userId: 1,
    title: "Physical Training",
    description: "Strengthen body and mind like Spartan warriors",
    icon: "💪",
    status: "active",
    streak: 12,
    category: "Strength",
    goal: "30 minutes daily",
    completed: true
  },
  {
    id: 3,
    userId: 1,
    title: "Reading Philosophy",
    description: "Study the teachings of great thinkers",
    icon: "📚",
    status: "active",
    streak: 5,
    category: "Knowledge",
    goal: "1 chapter daily",
    completed: false
  }
];

const mockQuests = [
  {
    id: 1,
    title: "Complete 5 habits today",
    description: "Channel your inner Hercules",
    xpReward: 50,
    type: "daily",
    progress: 2,
    total: 5
  },
  {
    id: 2,
    title: "Maintain 7-day streak",
    description: "Persistence like Odysseus",
    xpReward: 100,
    type: "weekly",
    progress: 7,
    total: 7
  }
];

const mockJournals = [
  {
    id: 1,
    userId: 1,
    entry: "Today I reflected on Socrates' teaching that 'the unexamined life is not worth living.' This wisdom resonates deeply with my journey of self-improvement.",
    sentiment: "positive",
    timestamp: new Date('2024-01-15').toISOString(),
    oracleTitle: "Wisdom of Self-Knowledge"
  },
  {
    id: 2,
    userId: 1,
    entry: "Struggling with maintaining my habits lately. Perhaps this is a test, like the trials faced by heroes in ancient myths.",
    sentiment: "neutral",
    timestamp: new Date('2024-01-14').toISOString(),
    oracleTitle: "The Hero's Challenge"
  },
  {
    id: 3,
    userId: 1,
    entry: "Achieved a new personal record in my training today! Feeling strong like the gods of Olympus.",
    sentiment: "positive",
    timestamp: new Date('2024-01-13').toISOString(),
    oracleTitle: "Divine Strength Awakened"
  }
];

const mockProfile = {
  id: 1,
  username: "PhilosopherWarrior",
  currentXP: 1250,
  maxXP: 2000,
  level: 8,
  totalHabits: 15,
  achievementsUnlocked: [
    {
      id: 1,
      title: "Wisdom Seeker",
      description: "Complete 10 meditation sessions",
      icon: "🦉",
      unlockedAt: "2024-01-10"
    },
    {
      id: 2,
      title: "Spartan Discipline",
      description: "Maintain a 30-day streak",
      icon: "🛡️",
      unlockedAt: "2024-01-05"
    },
    {
      id: 3,
      title: "Oracle's Insight",
      description: "Write 20 journal entries",
      icon: "📜",
      unlockedAt: "2024-01-12"
    }
  ]
};

// API functions
export const getHabits = async (userId) => {
  await delay(500);
  return mockHabits.filter(habit => habit.userId === userId);
};

export const completeHabit = async (habitId) => {
  await delay(300);
  const habit = mockHabits.find(h => h.id === habitId);
  if (habit) {
    habit.completed = true;
    habit.streak += 1;
    return { success: true, xpGained: 25, habit };
  }
  return { success: false };
};

export const getQuests = async (userId) => {
  await delay(400);
  return mockQuests;
};

export const getJournals = async (userId) => {
  await delay(600);
  return mockJournals.filter(journal => journal.userId === userId);
};

export const addJournalEntry = async (userId, entry) => {
  await delay(400);
  const sentiments = ['positive', 'neutral', 'negative'];
  const oracleTitles = [
    'Divine Inspiration',
    'Ancient Wisdom',
    'Philosophical Insight',
    'Hero\'s Reflection',
    'Oracle\'s Vision'
  ];
  
  const newEntry = {
    id: Date.now(),
    userId,
    entry,
    sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
    timestamp: new Date().toISOString(),
    oracleTitle: oracleTitles[Math.floor(Math.random() * oracleTitles.length)]
  };
  
  mockJournals.unshift(newEntry);
  return { success: true, entry: newEntry };
};

export const addHabit = async (userId, habitData) => {
  await delay(500);
  const newHabit = {
    id: Date.now(),
    userId,
    ...habitData,
    status: 'active',
    streak: 0,
    completed: false
  };
  
  mockHabits.push(newHabit);
  return { success: true, habit: newHabit };
};

export const getProfile = async (userId) => {
  await delay(300);
  return mockProfile;
};