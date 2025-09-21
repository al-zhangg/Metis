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

  // Deterministic fallback generator for journal analysis so Oracle's Wisdom varies per entry
  private generateJournalFallback(entry: string, salt: string = ''): JournalAnalysis {
    const hash = this.stringHash(entry + '|' + salt);
    const pick = <T>(arr: T[], offset: number = 0) => arr[(hash + offset) % arr.length];

    // Simple mood detection by keywords
    const lower = entry.toLowerCase();
    let mood: JournalAnalysis['mood'] = 'neutral';
    if (/grateful|happy|excited|proud|joy|win/.test(lower)) mood = 'positive';
    else if (/sad|tired|anxious|angry|frustrated|fail|failure/.test(lower)) mood = 'negative';
    else if (/mixed|conflicted|uncertain|unsure/.test(lower)) mood = 'mixed';

    const obstaclePool = [
      'Time management',
      'Motivation',
      'Distractions',
      'Perfectionism',
      'Self-doubt',
      'Overcommitment',
      'Lack of clarity',
      'Procrastination',
    ];

    const advicePool = [
      'Like Odysseus, chart your course by small stars; tiny bearings steer great voyages.',
      'As Athena counsels, sharpen habit through ritual—set a sacred hour and keep it.',
      'Like the phoenix, your setbacks are ash for the next ascent—rise methodically.',
      'Hercules conquered labors one by one; break yours into twelve gentle trials.',
      'Echo the Stoics: control the controllable, and let the winds bear the rest.',
      'As the Oracle at Delphi whispers, know thy next small action—then take it.',
      'Sisyphus smiles when he chooses the push; choose and the stone grows lighter.',
      'Like Theseus, follow a single thread; one clear goal defeats the maze.',
    ];

    const titlePool = [
      'Seeker of Truth',
      'Forge-Walker',
      'Warden of Small Steps',
      'Navigator of Storms',
      'Keeper of Rituals',
      'Bearer of the Inner Flame',
      'Student of the Lyceum',
      'Architect of Dawn',
    ];

    const stepsPool = [
      'Define tomorrow’s single highest-impact task.',
      'Reduce the task scope to a 10-minute starter.',
      'Schedule a fixed start time and protect it.',
      'Remove one distraction from your environment.',
      'Write a one-sentence intention for the day.',
      'Prepare materials the night before.',
      'Set a 15-minute timer and begin without judgement.',
      'Track one metric that reflects progress, not perfection.',
    ];

    // Pick 2-3 obstacles from pool, biased by hash
    const obstacles = [pick(obstaclePool, 1), pick(obstaclePool, 3)]
      .filter((v, i, a) => a.indexOf(v) === i);
    if ((hash % 3) === 0) {
      const extra = pick(obstaclePool, 5);
      if (!obstacles.includes(extra)) obstacles.push(extra);
    }

    // Pick 2-3 actionable steps
    const steps = [pick(stepsPool, 2), pick(stepsPool, 4)];
    if ((hash % 2) === 0) {
      const extra = pick(stepsPool, 6);
      if (!steps.includes(extra)) steps.push(extra);
    }

    return {
      mood,
      obstacles,
      mythicAdvice: pick(advicePool),
      oracleTitle: pick(titlePool, 7),
      actionableSteps: steps,
    };
  }

  // Simple string hash for deterministic selection
  private stringHash(s: string): number {
    let h = 2166136261 >>> 0; // FNV-1a basis
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
      h >>>= 0;
    }
    return h;
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
          max_tokens: 1000,
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
      // Best effort: try to extract the entry from the prompt for variability
      const m = /Entry:\s*([\s\S]*)\n\nPlease respond/.exec(prompt);
      const entry = m ? m[1].trim() : 'Untitled entry';
      return JSON.stringify(this.generateJournalFallback(entry));
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
      // If AI API not configured, use deterministic fallback generator for variety
      if (!this.apiUrl || !this.apiKey) {
        return this.generateJournalFallback(entry, new Date().toISOString());
      }
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

      // Generate a fallback variant to avoid repetition if API returns generic defaults
      const variant = this.generateJournalFallback(entry, new Date().toISOString());

      const defaultAdvice = 'Like Odysseus, your journey has challenges, but wisdom guides you home.';
      const defaultTitle = 'Seeker of Truth';
      const normalize = (s?: string) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
      const isGenericTitle = (s?: string) => {
        const n = normalize(s);
        return !n || n === normalize(defaultTitle) || n.includes('seeker of truth');
      };
      const isGenericAdvice = (s?: string) => {
        const n = normalize(s);
        return !n || n === normalize(defaultAdvice) || n.includes('odysseus') || n.length < 20;
      };

      const mood: JournalAnalysis['mood'] = parsed.mood || variant.mood || 'neutral';
      const obstacles: string[] = Array.isArray(parsed.obstacles) && parsed.obstacles.length > 0
        ? parsed.obstacles
        : variant.obstacles;
      const mythicAdvice: string = (typeof parsed.mythicAdvice === 'string' && !isGenericAdvice(parsed.mythicAdvice))
        ? parsed.mythicAdvice
        : variant.mythicAdvice;
      const oracleTitle: string = (typeof parsed.oracleTitle === 'string' && !isGenericTitle(parsed.oracleTitle))
        ? parsed.oracleTitle
        : variant.oracleTitle;
      const actionableSteps: string[] = Array.isArray(parsed.actionableSteps) && parsed.actionableSteps.length > 0
        ? parsed.actionableSteps
        : variant.actionableSteps;

      return { mood, obstacles, mythicAdvice, oracleTitle, actionableSteps };
    } catch (error) {
      console.error('Error analyzing journal:', error);
      return this.generateJournalFallback(entry);
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