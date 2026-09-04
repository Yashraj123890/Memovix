import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors ActiveClientsList/ClientRow's shape — same pattern as TeamSkeleton (features/team). */
export function ClientsSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className="divide-border -mx-6 flex flex-col divide-y">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 px-6 py-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-52" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
