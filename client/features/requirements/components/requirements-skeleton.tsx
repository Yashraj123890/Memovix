import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RequirementsSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-border divide-y">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-4 rounded" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-full max-w-sm" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-5 w-16" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
