import { cn } from '@/lib/utils';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-secondary-surface via-card-surface/70 to-secondary-surface border border-border-subtle/50',
        className
      )}
      {...props}
    />
  );
}
