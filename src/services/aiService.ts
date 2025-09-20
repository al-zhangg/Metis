// AI Service for habit classification, journal analysis, and goal adjustments
export interface HabitClassification {
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  suggestedFrequency: string;
  mythicTitle: string;
  wisdom: string;
}

export interface JournalAnalysis {
  mood: 'positive' | 'negative' | 'mixed' | 'neutral';
  obstacles: string[];
  mythicAdvice: string;
  oracleTitle: string;
  actionableSteps: string[];
}

export interface GoalAdjustment {
  recommendation: string;
  adjustedFrequency?: string;
  motivationalMessage: string;
  mythicGuidance: string;
}

class AIService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_AI_API_URL || '';
    this.apiKey = import.meta.env.VITE_AI_API_KEY || '';
  }

  private async makeAIRequest(prompt: string): Promise<any> {
    try {
      if (!this.apiUrl || !this.apiKey) {
        console.warn('AI API not configured, using fallback response');
        return this.getFallbackResponse(prompt);
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama3.1-8b',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`AI API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || this.getFallbackResponse(prompt);
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  private getFallbackResponse(prompt: string): string {
    if (prompt.includes('classify habit')) {
      return JSON.stringify({
        category: 'personal_growth',
        difficulty: 'medium',
        suggestedFrequency: 'daily',
        mythicTitle: 'Path of the Determined Hero',
        wisdom: 'Every great journey begins with a single step.'
      });
    } else if (prompt.includes('analyze journal')) {
      return JSON.stringify({
        mood: 'positive',
        obstacles: ['Time management', 'Motivation'],
        mythicAdvice: 'Like Odysseus, your journey has challenges, but wisdom guides you home.',
        oracleTitle: 'Seeker of Truth',
        actionableSteps: ['Reflect daily', 'Set small goals', 'Celebrate progress']
      });
    } else if (prompt.includes('goal adjustment')) {
      return JSON.stringify({
        recommendation: 'Continue your current path with minor adjustments',
        adjustedFrequency: 'daily',
        motivationalMessage: 'Your dedication shows the spirit of a true hero.',
        mythicGuidance: 'Like the phoenix, rise stronger from each challenge.'
      });
    }
    return JSON.stringify({
      category: 'personal_growth',
      difficulty: 'medium',
      suggestedFrequency: 'daily',
      mythicTitle: 'Path of the Determined Hero',
      wisdom: 'Every great journey begins with a single step.'
    });
  }

  async classifyHabit(title: string, description: string): Promise<HabitClassification> {
    try {
      const prompt = `Classify this habit and provide mythic wisdom:
Title: ${title}
Description: ${description}

Please respond with a JSON object containing:
- category (string): one of "health", "mindfulness", "productivity", "learning", "social", "creative", "personal_growth"
- difficulty (string): "easy", "medium", or "hard"
- suggestedFrequency (string): "daily", "weekly", or "monthly"
- mythicTitle (string): a heroic/mythological title for this habit
- wisdom (string): a short inspirational quote related to this habit

Respond only with valid JSON.`;

      const response = await this.makeAIRequest(prompt);
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      
      return {
        category: parsed.category || 'personal_growth',
        difficulty: parsed.difficulty || 'medium',
        suggestedFrequency: parsed.suggestedFrequency || 'daily',
        mythicTitle: parsed.mythicTitle || 'Path of the Determined Hero',
        wisdom: parsed.wisdom || 'Every great journey begins with a single step.'
      };
    } catch (error) {
      console.error('Error classifying habit:', error);
      return {
        category: 'personal_growth',
        difficulty: 'medium',
        suggestedFrequency: 'daily',
        mythicTitle: 'Path of the Determined Hero',
        wisdom: 'Every great journey begins with a single step.'
      };
    }
  }

  async analyzeJournal(entry: string): Promise<JournalAnalysis> {
    try {
      const prompt = `Analyze this journal entry and provide mythic wisdom:
Entry: ${entry}

Please respond with a JSON object containing:
- mood (string): "positive", "negative", "mixed", or "neutral"
- obstacles (array): list of challenges mentioned or implied
- mythicAdvice (string): wisdom in the style of ancient mythology
- oracleTitle (string): a mystical title for the person based on their entry
- actionableSteps (array): 2-3 specific actionable steps

Respond only with valid JSON.`;

      const response = await this.makeAIRequest(prompt);
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      
      return {
        mood: parsed.mood || 'neutral',
        obstacles: parsed.obstacles || ['Self-doubt'],
        mythicAdvice: parsed.mythicAdvice || 'Like Odysseus, your journey has challenges, but wisdom guides you home.',
        oracleTitle: parsed.oracleTitle || 'Seeker of Truth',
        actionableSteps: parsed.actionableSteps || ['Reflect daily', 'Set small goals']
      };
    } catch (error) {
      console.error('Error analyzing journal:', error);
      return {
        mood: 'neutral',
        obstacles: ['Self-doubt'],
        mythicAdvice: 'Like Odysseus, your journey has challenges, but wisdom guides you home.',
        oracleTitle: 'Seeker of Truth',
        actionableSteps: ['Reflect daily', 'Set small goals']
      };
    }
  }

  async suggestGoalAdjustment(
    habitTitle: string,
    currentStreak: number,
    completionRate: number,
    recentJournalEntries: string[]
  ): Promise<GoalAdjustment> {
    try {
      const prompt = `Analyze this habit progress and suggest adjustments:
Habit: ${habitTitle}
Current Streak: ${currentStreak} days
Completion Rate: ${completionRate}%
Recent Journal Context: ${recentJournalEntries.join(' ')}

Please respond with a JSON object containing:
- recommendation (string): specific advice for improvement
- adjustedFrequency (string): suggested frequency if changes needed
- motivationalMessage (string): encouraging message
- mythicGuidance (string): wisdom in mythological style

Respond only with valid JSON.`;

      const response = await this.makeAIRequest(prompt);
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      
      return {
        recommendation: parsed.recommendation || 'Continue your current path with minor adjustments',
        adjustedFrequency: parsed.adjustedFrequency,
        motivationalMessage: parsed.motivationalMessage || 'Your dedication shows the spirit of a true hero.',
        mythicGuidance: parsed.mythicGuidance || 'Like the phoenix, rise stronger from each challenge.'
      };
    } catch (error) {
      console.error('Error suggesting goal adjustment:', error);
      return {
        recommendation: 'Continue your current path with minor adjustments',
        motivationalMessage: 'Your dedication shows the spirit of a true hero.',
        mythicGuidance: 'Like the phoenix, rise stronger from each challenge.'
      };
    }
  }
}

export const aiService = new AIService();