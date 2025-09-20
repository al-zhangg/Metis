import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface CardProps {
  title: string;
  description: string;
  icon?: string | LucideIcon;
  status?: 'active' | 'completed' | 'inactive';
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  icon,
  status = 'active',
  children,
  onClick,
  className = ''
}) => {
  const statusColors = {
    active: 'border-bronze bg-marble',
    completed: 'border-laurel-green bg-green-50',
    inactive: 'border-gray-300 bg-gray-50'
  };

  const IconComponent = typeof icon === 'string' ? null : icon;

  return (
    <div
      className={`
        relative p-6 rounded-lg border-2 shadow-lg transform transition-all duration-300
        hover:scale-105 hover:shadow-xl cursor-pointer
        bg-gradient-to-br from-marble to-amber-50
        before:absolute before:inset-0 before:rounded-lg before:border-2 before:border-bronze
        before:opacity-20 before:transform before:rotate-1 before:-z-10
        ${statusColors[status]} ${className}
      `}
      onClick={onClick}
      style={{
        backgroundImage: `
          linear-gradient(45deg, rgba(184, 115, 51, 0.05) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(184, 115, 51, 0.05) 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, rgba(184, 115, 51, 0.05) 75%),
          linear-gradient(-45deg, transparent 75%, rgba(184, 115, 51, 0.05) 75%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
      }}
    >
      {/* Decorative scroll ends */}
      <div className="absolute -left-3 top-4 w-6 h-12 bg-bronze rounded-full opacity-60"></div>
      <div className="absolute -right-3 top-4 w-6 h-12 bg-bronze rounded-full opacity-60"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {typeof icon === 'string' ? (
              <span className="text-2xl">{icon}</span>
            ) : IconComponent ? (
              <IconComponent className="w-6 h-6 text-bronze" />
            ) : null}
            <h3 className="font-cinzel font-semibold text-lg text-midnight-blue">
              {title}
            </h3>
          </div>
          {status === 'completed' && (
            <div className="w-3 h-3 bg-laurel-green rounded-full animate-pulse"></div>
          )}
        </div>
        
        <p className="font-inter text-gray-700 mb-4 leading-relaxed">
          {description}
        </p>
        
        {children}
      </div>
    </div>
  );
};

export default Card;