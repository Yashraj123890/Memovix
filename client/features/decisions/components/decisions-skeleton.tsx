import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DecisionsSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-border divide-y">
          {Array.from({ length: 4 }).map((_, index) => (
            <li key={index} className="flex flex-col gap-2 px-4 py-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-3 w-20" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
