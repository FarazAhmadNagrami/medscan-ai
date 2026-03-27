export default function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-20" />
      ))}
    </div>
  );
}
