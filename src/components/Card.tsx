import React from 'react';

interface CardProps {
  title: string;
  description: string;
  icon?: string;
  status?: 'active' | 'completed' | 'paused';
  children?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  description, 
  icon, 
  status = 'active', 
  children,
  className = ''
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'border-laurel-green bg-green-50';
      case 'paused':
        return 'border-storm-gray bg-gray-50';
      default:
        return 'border-aegean-blue/20 bg-white';
    }
  };

  const getStatusIndicator = () => {
    switch (status) {
      case 'completed':
        return <div className="w-3 h-3 bg-laurel-green rounded-full animate-pulse"></div>;
      case 'paused':
        return <div className="w-3 h-3 bg-storm-gray rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-aegean-blue rounded-full animate-glow"></div>;
    }
  };

  return (
    <div className={`
      relative p-6 rounded-xl border-2 shadow-lg transform transition-all duration-300
      hover:scale-102 hover:shadow-xl backdrop-blur-sm
      ${getStatusColor()} ${className}
    `}>
      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        {getStatusIndicator()}
      </div>

      {/* Card header */}
      <div className="flex items-start gap-4 mb-4">
        {icon && (
          <div className="text-3xl animate-float">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-cinzel font-semibold text-lg text-midnight mb-2">
            {title}
          </h3>
          <p className="font-inter text-storm-gray text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Card content */}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}

      {/* Decorative elements */}
      <div className="absolute bottom-2 left-2 w-2 h-2 bg-bronze/20 rounded-full"></div>
      <div className="absolute top-2 left-2 w-1 h-1 bg-gold/30 rounded-full"></div>
    </div>
  );
};

export default Card;