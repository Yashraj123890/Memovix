import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors TimelineList's shape so nothing reflows once events load. */
export function TimelineSkeleton() {
  return (
    <Card>
      <CardContent>
        <ul className="flex flex-col">
          {Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="flex gap-3 pb-6">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2 pt-0.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
                <Skeleton className="h-3 w-16" />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
