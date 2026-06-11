import { cn } from "@/lib/utils";

export type LoadingSkeletonProps = {
  className?: string;
};

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Dang tai"
      className={cn("animate-pulse rounded-md bg-muted", className ?? "h-24 w-full")}
    />
  );
}
