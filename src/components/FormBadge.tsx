interface FormBadgeProps {
  result: 'W' | 'D' | 'L';
  size?: 'sm' | 'md' | 'lg';
}

export default function FormBadge({ result, size = 'md' }: FormBadgeProps) {
  const colors = {
    W: 'bg-emerald-500 text-white',
    D: 'bg-amber-500 text-white',
    L: 'bg-red-500 text-white',
  };

  const sizeClasses = {
    sm: 'h-5 w-5 text-xs',
    md: 'h-6 w-6 text-xs',
    lg: 'h-7 w-7 text-sm',
  };

  return (
    <span
      className={`inline-flex ${sizeClasses[size]} items-center justify-center rounded-full font-bold transition-transform hover:scale-110 ${colors[result]}`}
      title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
    >
      {result}
    </span>
  );
}
