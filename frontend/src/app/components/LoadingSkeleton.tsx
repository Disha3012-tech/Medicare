import { cn } from "../utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-muted", className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      className="bg-card rounded-xl border border-border p-5 space-y-3"
      aria-busy="true"
      aria-label="Loading..."
    >
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />

        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>

        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />

      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div
      className="space-y-3"
      aria-busy="true"
      aria-label="Loading..."
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonStatGrid({
  count = 4,
}: {
  count?: number;
}) {
  const cols =
    count >= 4
      ? "lg:grid-cols-4"
      : count === 3
      ? "lg:grid-cols-3"
      : count === 2
      ? "lg:grid-cols-2"
      : "lg:grid-cols-1";

  return (
    <div
      className={cn("grid grid-cols-2 gap-4", cols)}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-xl border border-border p-4 flex items-center gap-3"
        >
          <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />

          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({
  rows = 5,
}: {
  rows?: number;
}) {
  return (
    <div
      className="bg-card rounded-xl border border-border overflow-hidden"
      aria-busy="true"
    >
      <div className="px-5 py-3 border-b border-border bg-muted/40 flex gap-4">
        <Skeleton className="h-3 flex-[2]" />
        <Skeleton className="h-3 flex-1" />
        <Skeleton className="h-3 flex-1" />
        <Skeleton className="h-3 flex-1" />
        <Skeleton className="h-3 flex-1" />
      </div>

      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-5 py-4 flex gap-4 items-center border-b border-border last:border-0"
        >
          <div className="flex items-center gap-3 flex-[2]">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />

            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          </div>

          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 flex-1" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;