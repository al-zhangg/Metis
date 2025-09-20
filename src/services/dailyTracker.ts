// Daily completion tracking service
interface DailyCompletion {
  habitId: number;
  completedAt: string;
  date: string; // YYYY-MM-DD format
}

class DailyTracker {
  private storageKey = 'metis_daily_completions';

  private getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getCompletions(): DailyCompletion[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  private saveCompletions(completions: DailyCompletion[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(completions));
  }

  // Check if a habit was completed today
  isCompletedToday(habitId: number): boolean {
    const today = this.getTodayString();
    const completions = this.getCompletions();
    
    return completions.some(completion => 
      completion.habitId === habitId && completion.date === today
    );
  }

  // Mark a habit as completed for today
  markCompleted(habitId: number): boolean {
    if (this.isCompletedToday(habitId)) {
      return false; // Already completed today
    }

    const completions = this.getCompletions();
    const newCompletion: DailyCompletion = {
      habitId,
      completedAt: new Date().toISOString(),
      date: this.getTodayString()
    };

    completions.push(newCompletion);
    this.saveCompletions(completions);
    return true;
  }

  // Get completion streak for a habit
  getStreak(habitId: number): number {
    const completions = this.getCompletions()
      .filter(c => c.habitId === habitId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (completions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    
    // Check if completed today or yesterday (to account for different timezones)
    const today = this.getTodayString();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let checkDate = today;
    if (!completions.some(c => c.date === today)) {
      checkDate = yesterday;
      if (!completions.some(c => c.date === yesterday)) {
        return 0; // No recent completion
      }
    }

    // Count consecutive days
    for (let i = 0; i < completions.length; i++) {
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateString = expectedDate.toISOString().split('T')[0];

      if (completions.find(c => c.date === expectedDateString)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Clean up old completions (keep last 90 days)
  cleanup(): void {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const cutoffDate = ninetyDaysAgo.toISOString().split('T')[0];
    
    const completions = this.getCompletions();
    const filtered = completions.filter(c => c.date >= cutoffDate);
    
    this.saveCompletions(filtered);
  }

  // Get completion rate for last N days
  getCompletionRate(habitId: number, days: number = 30): number {
    const completions = this.getCompletions()
      .filter(c => c.habitId === habitId);

    if (completions.length === 0) return 0;

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentCompletions = completions.filter(c => 
      new Date(c.date) >= cutoffDate
    );

    return Math.round((recentCompletions.length / days) * 100);
  }

  // Reset all completions (for testing)
  reset(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const dailyTracker = new DailyTracker();