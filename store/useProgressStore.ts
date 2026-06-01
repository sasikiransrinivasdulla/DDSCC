import { create } from 'zustand';
import { ProgressState, ScoreBreakdown, DailyTask, UserProfile, HistoryLog, DisciplineKey } from '@/types';

// Standard mock initial scores
const initialScores: ScoreBreakdown = {
  dsa: 65,
  development: 50,
  skills: 40,
  core: 75,
  communication: 80,
  aptitude: 30,
};

// Initial placement preparation mock tasks
const initialTasks: DailyTask[] = [
  { id: '1', discipline: 'dsa', text: 'Solve 2 LeetCode Medium questions on Dynamic Programming', completed: true, timestamp: '10:15 AM' },
  { id: '2', discipline: 'dsa', text: 'Understand DFS vs BFS space complexity differences', completed: false, timestamp: '11:00 AM' },
  { id: '3', discipline: 'development', text: 'Refactor Tailwind components for DDSCC premium UI', completed: true, timestamp: '12:30 PM' },
  { id: '4', discipline: 'skills', text: 'Read about standard Docker containerization best practices', completed: false, timestamp: '02:00 PM' },
  { id: '5', discipline: 'core', text: 'Revise Operating System memory paging and thrashing', completed: true, timestamp: '04:15 PM' },
  { id: '6', discipline: 'communication', text: 'Record a 2-minute mock behavioral interview explanation', completed: false, timestamp: '05:30 PM' },
  { id: '7', discipline: 'aptitude', text: 'Complete a 15-minute quick test on Permutations and Combinations', completed: false, timestamp: '07:00 PM' },
];

// Historical tracker progress for analytics representation
const initialHistory: HistoryLog[] = [
  { date: '2026-05-24', score: 45, breakdown: { dsa: 40, development: 30, skills: 20, core: 60, communication: 70, aptitude: 50 }, tasksCompleted: 2 },
  { date: '2026-05-25', score: 55, breakdown: { dsa: 50, development: 40, skills: 30, core: 70, communication: 70, aptitude: 70 }, tasksCompleted: 3 },
  { date: '2026-05-26', score: 62, breakdown: { dsa: 60, development: 45, skills: 35, core: 70, communication: 80, aptitude: 80 }, tasksCompleted: 4 },
  { date: '2026-05-27', score: 50, breakdown: { dsa: 50, development: 40, skills: 30, core: 60, communication: 70, aptitude: 50 }, tasksCompleted: 3 },
  { date: '2026-05-28', score: 68, breakdown: { dsa: 65, development: 50, skills: 40, core: 75, communication: 80, aptitude: 100 }, tasksCompleted: 5 },
  { date: '2026-05-29', score: 72, breakdown: { dsa: 70, development: 60, skills: 50, core: 80, communication: 90, aptitude: 80 }, tasksCompleted: 6 },
  { date: '2026-05-30', score: 60, breakdown: initialScores, tasksCompleted: 4 },
];

export const useProgressStore = create<ProgressState>((set) => ({
  profile: {
    name: 'Candidate',
    role: 'Aspiring Computer Engineer',
    streakDays: 14,
    joinedAt: '2026-05-16',
    dailyOathCompleted: false,
    oathText: 'I will dedicate focused, deliberate effort toward my placement goals today. No excuses, no shortcuts, just relentless self-growth.',
  },
  scores: initialScores,
  tasks: initialTasks,
  history: initialHistory,
  isLoading: false,

  setProfile: (updatedProfile) =>
    set((state) => ({
      profile: { ...state.profile, ...updatedProfile },
    })),

  updateScore: (discipline, value) =>
    set((state) => {
      const newScores = { ...state.scores, [discipline]: Math.min(100, Math.max(0, value)) };
      return { scores: newScores };
    }),

  addTask: (discipline, text) =>
    set((state) => {
      const newTask: DailyTask = {
        id: Math.random().toString(36).substring(2, 9),
        discipline,
        text,
        completed: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      return { tasks: [newTask, ...state.tasks] };
    }),

  toggleTask: (id) =>
    set((state) => {
      const updatedTasks = state.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      
      // Calculate active task completeness for scores dynamically
      const activeCompleted = updatedTasks.filter((t) => t.completed).length;
      
      return {
        tasks: updatedTasks,
      };
    }),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),

  toggleDailyOath: () =>
    set((state) => {
      const newStatus = !state.profile.dailyOathCompleted;
      const newStreak = newStatus ? state.profile.streakDays + 1 : Math.max(0, state.profile.streakDays - 1);
      return {
        profile: {
          ...state.profile,
          dailyOathCompleted: newStatus,
          streakDays: newStreak,
        },
      };
    }),

  setOathText: (text) =>
    set((state) => ({
      profile: { ...state.profile, oathText: text },
    })),

  resetDailyTasks: () =>
    set((state) => ({
      tasks: state.tasks.map((task) => ({ ...task, completed: false })),
      profile: { ...state.profile, dailyOathCompleted: false },
    })),
}));
