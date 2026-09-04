import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors TeamList/TeamMemberRow's shape so nothing reflows once members load. */
export function TeamSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className="divide-border -mx-6 flex flex-col divide-y">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 px-6 py-3">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-52" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="hidden h-3 w-24 sm:block" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
