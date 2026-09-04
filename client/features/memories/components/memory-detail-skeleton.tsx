import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MemoryDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-4 w-20" />

      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
          </div>

          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <Skeleton className="h-px w-full" />
          <Skeleton className="h-3 w-64" />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2 pt-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
