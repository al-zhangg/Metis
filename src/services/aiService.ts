// AI Service for Metis - Powered by Cerebras or compatible AI API
interface HabitClassification {
  category: 'health' | 'learning' | 'productivity' | 'mindfulness' | 'social' | 'creativity';
  difficulty: 'easy' | 'medium' | 'hard';
  suggestedFrequency: 'daily' | 'weekly' | 'bi-weekly';
  mythicTitle: string;
  wisdom: string;
}

interface JournalInsight {
  mood: 'positive' | 'neutral' | 'negative' | 'mixed';
  obstacles: string[];
  mythicAdvice: string;
  oracleTitle: string;
  actionableSteps: string[];
}

interface GoalAdjustment {
  recommendation: 'increase' | 'maintain' | 'decrease' | 'pause';
  reason: string;
  mythicGuidance: string;
  adjustedTarget: string;
}

class AIService {
  private apiUrl: string;
  private apiKey: string;
  private cache: Map<string, any> = new Map();

  constructor() {
    this.apiUrl = import.meta.env.VITE_AI_API_URL || '';
    this.apiKey = import.meta.env.VITE_AI_API_KEY || '';
    
    // Validate configuration
    if (!this.apiUrl || !this.apiKey) {
      console.warn('AI Service: Missing API URL or API Key. Using fallback responses.');
    }
  }

  private async makeAIRequest(prompt: string, systemPrompt: string): Promise<any> {
    const cacheKey = `${systemPrompt}-${prompt}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // If no API configuration, use fallback immediately
    if (!this.apiUrl || !this.apiKey) {
      console.warn('AI Service: No API configuration found, using fallback response');
      return this.getFallbackResponse(prompt, systemPrompt);
    }

    try {
      // Simulate AI API call - replace with actual Cerebras API
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error('AI API request failed');
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      // Cache the result
      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('AI Service Error:', error);
      // Return fallback response
      return this.getFallbackResponse(prompt, systemPrompt);
    }
  }

  private getFallbackResponse(prompt: string, systemPrompt: string): any {
    // Fallback responses when AI is unavailable
    if (systemPrompt.includes('habit classification')) {
      return {
        category: 'health',
        difficulty: 'medium',
        suggestedFrequency: 'daily',
        mythicTitle: 'Path of the Disciplined Warrior',
        wisdom: 'Every small step builds the foundation of greatness.'
      };
    }
    
    if (systemPrompt.includes('journal analysis')) {
      return {
        mood: 'neutral',
        obstacles: ['Time management', 'Motivation'],
        mythicAdvice: 'Like Odysseus facing the sirens, stay true to your course.',
        oracleTitle: 'The Seeker\'s Reflection',
        actionableSteps: ['Break tasks into smaller steps', 'Set specific times for habits']
      };
    }

    return {};
  }

  async classifyHabit(habitName: string, description: string): Promise<HabitClassification> {
    const systemPrompt = `You are Metis, the Greek goddess of wisdom and counsel. Analyze habits and provide structured classification with mythic wisdom. Always respond with valid JSON in this exact format:
    {
      "category": "health|learning|productivity|mindfulness|social|creativity",
      "difficulty": "easy|medium|hard",
      "suggestedFrequency": "daily|weekly|bi-weekly",
      "mythicTitle": "A poetic title inspired by Greek mythology",
      "wisdom": "A short, inspiring piece of wisdom (max 100 characters)"
    }`;

    const prompt = `Classify this habit:
    Name: ${habitName}
    Description: ${description}
    
    Consider behavioral science principles for difficulty assessment.`;

    return await this.makeAIRequest(prompt, systemPrompt);
  }

  async analyzeJournal(entry: string): Promise<JournalInsight> {
    const systemPrompt = `You are the Oracle of Delphi, providing wisdom through journal analysis. Extract mood, identify obstacles, and offer mythic yet actionable advice. Always respond with valid JSON in this exact format:
    {
      "mood": "positive|neutral|negative|mixed",
      "obstacles": ["obstacle1", "obstacle2"],
      "mythicAdvice": "Short mythic wisdom (max 150 characters)",
      "oracleTitle": "A mystical title for this reflection",
      "actionableSteps": ["step1", "step2"]
    }`;

    const prompt = `Analyze this journal entry and provide insights:
    "${entry}"
    
    Focus on emotional tone, challenges mentioned, and practical next steps.`;

    return await this.makeAIRequest(prompt, systemPrompt);
  }

  async suggestGoalAdjustment(
    habitName: string, 
    currentStreak: number, 
    completionRate: number, 
    recentEntries: string[]
  ): Promise<GoalAdjustment> {
    const systemPrompt = `You are Athena, goddess of wisdom and strategy. Analyze habit progress and suggest adaptive adjustments. Always respond with valid JSON in this exact format:
    {
      "recommendation": "increase|maintain|decrease|pause",
      "reason": "Brief explanation of the recommendation",
      "mythicGuidance": "Mythic wisdom about the adjustment (max 120 characters)",
      "adjustedTarget": "Specific suggestion for the new target"
    }`;

    const prompt = `Analyze this habit progress:
    Habit: ${habitName}
    Current Streak: ${currentStreak} days
    Completion Rate: ${completionRate}%
    Recent Journal Mentions: ${recentEntries.join(', ')}
    
    Suggest whether to increase, maintain, decrease difficulty, or pause.`;

    return await this.makeAIRequest(prompt, systemPrompt);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const aiService = new AIService();
export type { HabitClassification, JournalInsight, GoalAdjustment };