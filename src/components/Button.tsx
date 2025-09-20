import React from 'react';

interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'disabled';
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false
}) => {
  const baseClasses = `
    px-6 py-3 rounded-lg font-inter font-medium transition-all duration-300
    transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2
    disabled:cursor-not-allowed disabled:transform-none disabled:opacity-50
  `;

  const variantClasses = {
    primary: `
      bg-bronze text-white shadow-lg hover:bg-bronze/90 hover:shadow-xl
      focus:ring-bronze/50 active:bg-bronze/80
    `,
    secondary: `
      bg-laurel-green text-white shadow-lg hover:bg-laurel-green/90 hover:shadow-xl
      focus:ring-laurel-green/50 active:bg-laurel-green/80
    `,
    disabled: `
      bg-gray-400 text-white cursor-not-allowed
    `
  };

  const actualVariant = disabled ? 'disabled' : variant;

  return (
    <button
      className={`${baseClasses} ${variantClasses[actualVariant]} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <span className="relative z-10">{text}</span>
      
      {/* Decorative elements for primary button */}
      {actualVariant === 'primary' && (
        <>
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-bronze to-amber-600 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
          <div className="absolute -inset-1 rounded-lg bg-bronze opacity-0 hover:opacity-10 blur transition-opacity duration-300"></div>
        </>
      )}
      
      {/* Decorative elements for secondary button */}
      {actualVariant === 'secondary' && (
        <>
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-laurel-green to-green-600 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
          <div className="absolute -inset-1 rounded-lg bg-laurel-green opacity-0 hover:opacity-10 blur transition-opacity duration-300"></div>
        </>
      )}
    </button>
  );
};

export default Button;