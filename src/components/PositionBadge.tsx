interface PositionBadgeProps {
  position: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function PositionBadge({ position, size = 'md' }: PositionBadgeProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  // Gold medal for 1st place
  if (position === 1) {
    return (
      <div className={`flex ${sizeClasses[size]} items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 font-bold text-white shadow-lg shadow-yellow-500/30`}>
        {position}
      </div>
    );
  }

  // Silver medal for 2nd place
  if (position === 2) {
    return (
      <div className={`flex ${sizeClasses[size]} items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 font-bold text-white shadow-lg shadow-gray-400/30`}>
        {position}
      </div>
    );
  }

  // Bronze medal for 3rd place
  if (position === 3) {
    return (
      <div className={`flex ${sizeClasses[size]} items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-800 font-bold text-white shadow-lg shadow-amber-600/30`}>
        {position}
      </div>
    );
  }

  // Regular badge for other positions
  return (
    <div className={`flex ${sizeClasses[size]} items-center justify-center rounded-full bg-zinc-200 font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300`}>
      {position}
    </div>
  );
}
