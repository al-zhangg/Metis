import React from 'react';

interface ButtonProps {
  text: string;
  onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  text, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  className = ''
}) => {
  const baseClasses = `
    px-6 py-3 rounded-lg font-inter font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 transform
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:transform-none
    ${!disabled ? 'hover:scale-105 active:scale-95' : ''}
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-aegean-blue to-deep-aegean text-white
      hover:from-deep-aegean hover:to-aegean-blue
      focus:ring-aegean-blue shadow-lg hover:shadow-xl
    `,
    secondary: `
      bg-slate-mist text-storm-gray border-2 border-storm-gray/20
      hover:bg-storm-gray hover:text-white hover:border-storm-gray
      focus:ring-storm-gray
    `,
    danger: `
      bg-red-600 text-white border-2 border-red-600
      hover:bg-red-700 hover:border-red-700
      focus:ring-red-600
      disabled:bg-red-400 disabled:border-red-400
    `
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {text}
    </button>
  );
};

export default Button;
