import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading placeholder for a project section's content column. The project
 * identity + navigation now live in ProjectSidebar (which shows its own
 * identity skeleton), so this only stands in for the page content.
 */
export function ProjectWorkspaceSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-full max-w-md" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
