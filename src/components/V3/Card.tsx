import React from 'react';

interface CardProps {
  children?: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline' | 'borderless';
  bordered?: boolean;
}

const sizeStyles = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const variantStyles = {
  primary: 'border-[#FF6B35] bg-[#FFF0EB]',
  secondary: 'border-gray-300 bg-gray-50',
  outline: 'border-2 border-[#FF6B35] bg-transparent',
  borderless: 'border-none shadow-none',
};

export const Card: React.FC<CardProps> = ({
  children,
  title,
  footer,
  className = '',
  hoverable = false,
  onClick,
  size = 'lg',
  variant = 'primary',
  bordered = true,
}) => {
  return (
    <div
      className={`
        bg-white rounded-xl
        ${bordered && variant !== 'borderless' ? 'border' : ''}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${hoverable ? 'hover:shadow-lg cursor-pointer transition-all duration-300' : 'shadow-sm'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {title && (
        <div className="text-lg font-semibold mb-3">{title}</div>
      )}
      {children}
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
