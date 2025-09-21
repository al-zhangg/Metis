// Weekly completion tracking service
interface WeeklyCompletion {
  habitId: number;
  completedAt: string; // ISO timestamp
  yearWeek: string; // e.g., 2025-W38
}

class WeeklyTracker {
  private storageKey = 'metis_weekly_completions';

  private getYearWeek(date: Date = new Date()): string {
    // ISO week number calculation
    // Copy date so don't modify original
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    // Year of the week
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const year = d.getUTCFullYear();
    const weekStr = String(weekNo).padStart(2, '0');
    return `${year}-W${weekStr}`;
  }

  private getCompletions(): WeeklyCompletion[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private saveCompletions(completions: WeeklyCompletion[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(completions));
  }

  // Check if a habit was completed this ISO week
  isCompletedThisWeek(habitId: number): boolean {
    const yw = this.getYearWeek();
    const completions = this.getCompletions();
    return completions.some(c => c.habitId === habitId && c.yearWeek === yw);
  }

  // Mark a habit as completed for this week
  markCompleted(habitId: number): boolean {
    if (this.isCompletedThisWeek(habitId)) return false;
    const completions = this.getCompletions();
    completions.push({ habitId, completedAt: new Date().toISOString(), yearWeek: this.getYearWeek() });
    this.saveCompletions(completions);
    return true;
  }

  // Get weekly streak (consecutive ISO weeks)
  getStreak(habitId: number): number {
    const completions = this.getCompletions().filter(c => c.habitId === habitId);
    if (completions.length === 0) return 0;

    // Build a Set of yearWeek strings for fast lookup
    const set = new Set(completions.map(c => c.yearWeek));

    // Start from current week; if not completed this week, also check last week as starting point
    let streak = 0;
    let date = new Date();
    const tryWeeks = 104; // limit guard
    let started = false;

    for (let i = 0; i < tryWeeks; i++) {
      const yw = this.getYearWeek(date);
      if (!started) {
        if (set.has(yw)) {
          started = true;
          streak++;
        } else {
          // also allow starting from last week if this week not completed
          const prev = new Date(date);
          prev.setUTCDate(prev.getUTCDate() - 7);
          const ywPrev = this.getYearWeek(prev);
          if (set.has(ywPrev)) {
            date = prev;
            started = true;
            streak++;
          } else {
            return 0;
          }
        }
      } else {
        // move back one week and check
        date.setUTCDate(date.getUTCDate() - 7);
        const nextYW = this.getYearWeek(date);
        if (set.has(nextYW)) {
          streak++;
        } else {
          break;
        }
      }
    }

    return streak;
  }

  // Completion rate over last N weeks
  getCompletionRate(habitId: number, weeks: number = 12): number {
    const completions = this.getCompletions().filter(c => c.habitId === habitId);
    if (completions.length === 0) return 0;

    // Build set for last N weeks
    const set = new Set(completions.map(c => c.yearWeek));
    let count = 0;
    const today = new Date();
    for (let i = 0; i < weeks; i++) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i * 7);
      const yw = this.getYearWeek(d);
      if (set.has(yw)) count++;
    }
    return Math.round((count / weeks) * 100);
  }

  reset(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const weeklyTracker = new WeeklyTracker();
