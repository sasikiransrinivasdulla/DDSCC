'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ProgressCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  size?: number; // size in pixels
  strokeWidth?: number; // stroke width of the progress circle
  showText?: boolean;
  textSub?: string;
}

export const ProgressCircle = ({
  value,
  size = 120,
  strokeWidth = 8,
  showText = true,
  textSub = 'Complete',
  className,
  ...props
}: ProgressCircleProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Bound the progress between 0 and 100
  const normalizedValue = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className={cn('relative flex items-center justify-center', className)} {...props}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle Track */}
        <circle
          className="stroke-secondary-surface"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        
        {/* Foreground Progress Circle */}
        <motion.circle
          className="stroke-primary-accent filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-out"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      
      {showText && (
        <div className="absolute flex flex-col items-center justify-center text-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-black text-primary-text font-heading leading-none"
          >
            {Math.round(normalizedValue)}%
          </motion.span>
          {textSub && (
            <span className="text-[10px] uppercase font-semibold text-muted-text mt-1 tracking-wider leading-none">
              {textSub}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
ProgressCircle.displayName = 'ProgressCircle';
