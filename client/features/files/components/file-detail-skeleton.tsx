import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FileDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5">
          <Skeleton className="aspect-video w-full rounded-lg" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-9 w-full rounded-md sm:w-28" />
          </div>

          <Skeleton className="h-px w-full" />

          <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
