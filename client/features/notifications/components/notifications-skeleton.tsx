import { Skeleton } from "@/components/ui/skeleton";

interface NotificationsSkeletonProps {
  count?: number;
}

export function NotificationsSkeleton({ count = 5 }: NotificationsSkeletonProps) {
  return (
    <div className="divide-border flex flex-col divide-y">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-start gap-3 px-3 py-2.5">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
