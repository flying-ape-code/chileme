import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'underlined';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, size = 'md', variant = 'outline', type = 'text', className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    };

    const variantClasses = {
      outline: 'border border-gray-300 bg-white',
      filled: 'border border-transparent bg-gray-100',
      underlined: 'border-b border-gray-300 bg-transparent px-0',
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`
              block w-full rounded-lg transition-all duration-200
              ${sizeClasses[size]}
              ${variantClasses[variant]}
              ${error 
                ? 'border-[#EF5350] focus:border-[#EF5350] focus:ring-[#EF5350]' 
                : 'focus:border-[#FF6B35] focus:ring-[#FF6B35]'
              }
              focus:outline-none focus:ring-1
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
