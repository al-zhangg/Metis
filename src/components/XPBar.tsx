import React from 'react';

interface XPBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  className?: string;
}

const XPBar: React.FC<XPBarProps> = ({
  currentXP,
  maxXP,
  level,
  className = ''
}) => {
  const percentage = Math.min((currentXP / maxXP) * 100, 100);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="font-cinzel font-semibold text-bronze text-lg">
          Level {level}
        </span>
      </div>
      
      {/* Amphora-style XP bar */}
      <div className="flex-1 relative">
        <div className="relative w-full h-8 bg-marble border-2 border-bronze rounded-full overflow-hidden shadow-inner">
          {/* Amphora shape decorations */}
          <div className="absolute left-2 top-1 w-2 h-6 bg-bronze/30 rounded-full"></div>
          <div className="absolute right-2 top-1 w-2 h-6 bg-bronze/30 rounded-full"></div>
          
          {/* XP fill with liquid effect */}
          <div
            className="absolute bottom-0 left-0 h-full bg-gradient-to-r from-bronze via-amber-500 to-bronze
                       shadow-inner transition-all duration-1000 ease-out origin-bottom animate-fill-amphora"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, 
                rgba(184, 115, 51, 0.8) 0%, 
                rgba(245, 158, 11, 0.9) 50%, 
                rgba(184, 115, 51, 0.8) 100%)`
            }}
          >
            {/* Liquid shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                            transform -skew-x-12 animate-pulse"></div>
          </div>
          
          {/* Amphora mouth decoration */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-bronze/40 rounded-b-full"></div>
        </div>
        
        {/* XP text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-inter font-medium text-midnight-blue text-sm drop-shadow-sm">
            {currentXP} / {maxXP} XP
          </span>
        </div>
      </div>
    </div>
  );
};

export default XPBar;