// Monthly completion tracking service
interface MonthlyCompletion {
  habitId: number;
  completedAt: string; // ISO timestamp
  yearMonth: string; // e.g., 2025-09
}

class MonthlyTracker {
  private storageKey = 'metis_monthly_completions';

  private getYearMonth(date: Date = new Date()): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  private getCompletions(): MonthlyCompletion[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private saveCompletions(completions: MonthlyCompletion[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(completions));
  }

  isCompletedThisMonth(habitId: number): boolean {
    const ym = this.getYearMonth();
    const completions = this.getCompletions();
    return completions.some(c => c.habitId === habitId && c.yearMonth === ym);
  }

  markCompleted(habitId: number): boolean {
    if (this.isCompletedThisMonth(habitId)) return false;
    const completions = this.getCompletions();
    completions.push({ habitId, completedAt: new Date().toISOString(), yearMonth: this.getYearMonth() });
    this.saveCompletions(completions);
    return true;
  }

  getStreak(habitId: number): number {
    const completions = this.getCompletions().filter(c => c.habitId === habitId);
    if (completions.length === 0) return 0;
    const set = new Set(completions.map(c => c.yearMonth));

    let streak = 0;
    let date = new Date();
    let started = false;

    for (let i = 0; i < 60; i++) { // check up to 5 years back
      const ym = this.getYearMonth(date);
      if (!started) {
        if (set.has(ym)) {
          started = true;
          streak++;
        } else {
          // also allow starting from previous month if not completed this month
          const prev = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
          const ymPrev = this.getYearMonth(prev);
          if (set.has(ymPrev)) {
            date = prev;
            started = true;
            streak++;
          } else {
            return 0;
          }
        }
      } else {
        // move back one month
        date = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
        const nextYM = this.getYearMonth(date);
        if (set.has(nextYM)) {
          streak++;
        } else {
          break;
        }
      }
    }

    return streak;
  }

  getCompletionRate(habitId: number, months: number = 12): number {
    const completions = this.getCompletions().filter(c => c.habitId === habitId);
    if (completions.length === 0) return 0;
    const set = new Set(completions.map(c => c.yearMonth));
    let count = 0;
    let date = new Date();
    for (let i = 0; i < months; i++) {
      const ym = this.getYearMonth(date);
      if (set.has(ym)) count++;
      date = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
    }
    return Math.round((count / months) * 100);
  }

  reset(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const monthlyTracker = new MonthlyTracker();
