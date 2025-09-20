import React from 'react';
import { Sparkles, Brain, Target } from 'lucide-react';

interface AIInsightCardProps {
  type: 'wisdom' | 'analysis' | 'adjustment';
  title: string;
  content: string;
  actionableSteps?: string[];
  className?: string;
}

const AIInsightCard: React.FC<AIInsightCardProps> = ({
  type,
  title,
  content,
  actionableSteps = [],
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'wisdom':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'analysis':
        return <Brain className="w-5 h-5 text-purple-500" />;
      case 'adjustment':
        return <Target className="w-5 h-5 text-blue-500" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'wisdom':
        return 'from-amber-50 to-orange-50 border-amber-200';
      case 'analysis':
        return 'from-purple-50 to-indigo-50 border-purple-200';
      case 'adjustment':
        return 'from-blue-50 to-cyan-50 border-blue-200';
    }
  };

  return (
    <div className={`
      relative p-4 rounded-lg border-2 shadow-md bg-gradient-to-br
      ${getGradient()} ${className}
      transform transition-all duration-300 hover:scale-102 hover:shadow-lg
    `}>
      {/* AI indicator */}
      <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-gray-500">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="font-inter">AI</span>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 rounded-full bg-white shadow-sm">
          {getIcon()}
        </div>
        
        <div className="flex-1">
          <h4 className="font-cinzel font-semibold text-midnight-blue mb-2">
            {title}
          </h4>
          
          <p className="font-inter text-gray-700 text-sm leading-relaxed mb-3">
            {content}
          </p>
          
          {actionableSteps.length > 0 && (
            <div className="space-y-1">
              <p className="font-inter font-medium text-xs text-gray-600 uppercase tracking-wide">
                Actionable Steps:
              </p>
              <ul className="space-y-1">
                {actionableSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-bronze rounded-full mt-2 flex-shrink-0"></span>
                    <span className="font-inter">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsightCard;