'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', size = 'md', isLoading, disabled, ...props }, ref) => {
    
    // Core styling classes mapping
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-primary-accent/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
    
    const variants = {
      primary: 'bg-primary-accent text-[#050505] font-semibold hover:bg-soft-accent hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] shadow-[0_0_15px_rgba(16,185,129,0.15)] border border-transparent',
      secondary: 'bg-secondary-surface text-primary-text border border-border-subtle hover:border-primary-accent/30 hover:bg-card-surface',
      outline: 'bg-transparent text-muted-text hover:text-primary-text border border-border-subtle hover:border-primary-accent/20',
      ghost: 'bg-transparent text-muted-text hover:text-primary-text hover:bg-secondary-surface/60',
      glow: 'bg-background text-primary-accent border border-primary-accent/20 hover:border-primary-accent/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={disabled ? undefined : { scale: 1.015 }}
        whileTap={disabled ? undefined : { scale: 0.985 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
