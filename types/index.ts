export type DisciplineKey = 'dsa' | 'development' | 'skills' | 'core' | 'communication' | 'aptitude';

export interface SectionDetails {
  key: DisciplineKey;
  title: string;
  description: string;
  color: string;
  iconName: string;
}

export interface ScoreBreakdown {
  dsa: number;
  development: number;
  skills: number;
  core: number;
  communication: number;
  aptitude: number;
}

export interface DailyTask {
  id: string;
  discipline: DisciplineKey;
  text: string;
  completed: boolean;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  role: string;
  streakDays: number;
  joinedAt: string;
  dailyOathCompleted: boolean;
  oathText: string;
}

export interface HistoryLog {
  date: string; // YYYY-MM-DD
  score: number; // overall percentage (0-100)
  breakdown: ScoreBreakdown;
  tasksCompleted: number;
}

export interface ProgressState {
  profile: UserProfile;
  scores: ScoreBreakdown;
  tasks: DailyTask[];
  history: HistoryLog[];
  isLoading: boolean;
  
  // Setters and Actions for state changes (State Prep)
  setProfile: (profile: Partial<UserProfile>) => void;
  updateScore: (discipline: DisciplineKey, value: number) => void;
  addTask: (discipline: DisciplineKey, text: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  toggleDailyOath: () => void;
  setOathText: (text: string) => void;
  resetDailyTasks: () => void;
}
