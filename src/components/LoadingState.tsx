interface LoadingStateProps {
  message?: string;
  className?: string;
}

export default function LoadingState({ message = 'Loading...', className = '' }: LoadingStateProps) {
  return (
    <div className={`flex min-h-[400px] flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative h-16 w-16">
        <div className="absolute h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></div>
        <div className="relative flex h-full w-full items-center justify-center rounded-full bg-indigo-600">
          <svg
            className="h-8 w-8 animate-spin text-white"
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{message}</p>
    </div>
  );
}

// Skeleton loader for tables
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
          <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700"></div>
            <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700"></div>
          </div>
          <div className="h-8 w-12 rounded bg-zinc-200 dark:bg-zinc-700"></div>
        </div>
      ))}
    </div>
  );
}
