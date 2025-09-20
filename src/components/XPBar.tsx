import React from 'react';
import { Crown } from 'lucide-react';

interface XPBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  className?: string;
}

const XPBar: React.FC<XPBarProps> = ({ currentXP, maxXP, level, className = '' }) => {
  const percentage = Math.min((currentXP / maxXP) * 100, 100);
  const nextLevelXP = maxXP - currentXP;

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-aegean-blue/20 shadow-lg ${className}`}>
      {/* Level and XP info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gold to-bronze rounded-full flex items-center justify-center shadow-lg">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-cinzel font-bold text-xl text-midnight">
              Level {level}
            </h3>
            <p className="font-inter text-sm text-storm-gray">
              Divine Warrior
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-inter font-semibold text-midnight">
            {currentXP.toLocaleString()} XP
          </p>
          <p className="font-inter text-sm text-storm-gray">
            {nextLevelXP.toLocaleString()} to next level
          </p>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="relative">
        <div className="w-full bg-slate-mist rounded-full h-4 shadow-inner">
          <div
            className="bg-gradient-to-r from-aegean-blue via-deep-aegean to-aegean-blue h-4 rounded-full
                       transition-all duration-1000 ease-out shadow-lg relative overflow-hidden"
            style={{ width: `${percentage}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent
                           transform -skew-x-12 animate-pulse"></div>
          </div>
        </div>
        
        {/* Progress text */}
        <div className="flex justify-between mt-2">
          <span className="font-inter text-xs text-storm-gray">
            {percentage.toFixed(1)}% Complete
          </span>
          <span className="font-inter text-xs text-storm-gray">
            Level {level + 1}
          </span>
        </div>
      </div>
    </div>
  );
};

export default XPBar;