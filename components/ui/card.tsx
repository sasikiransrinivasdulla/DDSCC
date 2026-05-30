'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glowEffect?: boolean;
  asMotion?: boolean;
  delay?: number;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = false, glowEffect = false, asMotion = false, delay = 0, children, ...props }, ref) => {
    const baseClass = cn(
      'bg-card-surface border border-border-subtle rounded-xl overflow-hidden shadow-xl transition-all duration-300 relative',
      hoverEffect && 'hover:border-primary-accent/30 hover:-translate-y-[2px] cursor-pointer',
      glowEffect && 'glow-emerald-sm border-primary-accent/10',
      className
    );

    // Decorative subtle top border line for glowing cards
    const topGlowBorder = glowEffect && (
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-accent/40 to-transparent" />
    );

    if (asMotion) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
          className={baseClass}
          {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}
        >
          {topGlowBorder}
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={baseClass} {...props}>
        {topGlowBorder}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pb-4 flex flex-col gap-1.5', className)} {...props} />
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-lg font-bold font-heading text-primary-text tracking-tight', className)} {...props} />
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-muted-text font-normal leading-relaxed', className)} {...props} />
);
CardDescription.displayName = 'CardDescription';

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-0 text-sm leading-relaxed text-primary-text/90', className)} {...props} />
);
CardContent.displayName = 'CardContent';

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-0 border-t border-border-subtle/40 flex items-center justify-between', className)} {...props} />
);
CardFooter.displayName = 'CardFooter';
