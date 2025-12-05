import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

// Video skeleton loader
function VideoSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-card shadow-soft", className)}>
      <div className="aspect-video bg-muted flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

// Chat skeleton loader
function ChatSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-card shadow-soft", className)}>
      <div className="border-b border-border bg-muted/50 px-6 py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="h-[400px] p-6 space-y-4">
        <Skeleton className="mx-auto h-4 w-48" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 border-t border-border bg-muted/30 p-4">
        <Skeleton className="flex-1 h-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
    </div>
  );
}

// Module card skeleton
function ModuleCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <Skeleton className="mt-4 h-9 w-full rounded-md" />
    </div>
  );
}

export { Skeleton, VideoSkeleton, ChatSkeleton, ModuleCardSkeleton };
