import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import Button from './Button';
import AIInsightCard from './AIInsightCard';
import { enhancedApi } from '../services/enhancedApi';
import type { GoalAdjustment } from '../services/aiService';

interface HabitProgressAnalysisProps {
  habitId: number;
  habitName: string;
  currentStreak: number;
  completionRate: number;
  onAdjustmentApplied?: () => void;
}

const HabitProgressAnalysis: React.FC<HabitProgressAnalysisProps> = ({
  habitId,
  habitName,
  currentStreak,
  completionRate,
  onAdjustmentApplied
}) => {
  const [analysis, setAnalysis] = useState<GoalAdjustment | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await enhancedApi.analyzeHabitProgress(habitId);
      setAnalysis(result);
      setShowAnalysis(true);
    } catch (error) {
      console.error('Failed to analyze habit:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'increase':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="w-5 h-5 text-orange-500" />;
      case 'pause':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-blue-500" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'increase':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'decrease':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'pause':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Analysis Trigger */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-bronze/20">
        <div>
          <h3 className="font-cinzel font-semibold text-midnight-blue">
            AI Progress Analysis
          </h3>
          <p className="font-inter text-sm text-gray-600">
            Get personalized recommendations for "{habitName}"
          </p>
        </div>
        <Button
          text={loading ? "Analyzing..." : "Analyze Progress"}
          onClick={handleAnalyze}
          variant="secondary"
          disabled={loading}
        />
      </div>

      {/* Analysis Results */}
      {showAnalysis && analysis && (
        <div className="space-y-4">
          {/* Recommendation Summary */}
          <div className={`
            p-4 rounded-lg border-2 flex items-start gap-3
            ${getRecommendationColor(analysis.recommendation)}
          `}>
            <div className="flex-shrink-0 p-2 bg-white rounded-full shadow-sm">
              {getRecommendationIcon(analysis.recommendation)}
            </div>
            <div className="flex-1">
              <h4 className="font-cinzel font-semibold text-lg capitalize mb-2">
                Recommendation: {analysis.recommendation}
              </h4>
              <p className="font-inter text-sm mb-3">
                {analysis.reason}
              </p>
              <div className="bg-white/50 rounded-lg p-3">
                <p className="font-inter font-medium text-sm">
                  Suggested Target: {analysis.adjustedTarget}
                </p>
              </div>
            </div>
          </div>

          {/* Mythic Guidance */}
          <AIInsightCard
            type="wisdom"
            title="Oracle's Guidance"
            content={analysis.mythicGuidance}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              text="Apply Recommendation"
              onClick={() => {
                onAdjustmentApplied?.();
                setShowAnalysis(false);
              }}
              variant="primary"
            />
            <Button
              text="Keep Current Goal"
              onClick={() => setShowAnalysis(false)}
              variant="secondary"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitProgressAnalysis;