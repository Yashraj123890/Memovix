import { Skeleton } from "@/components/ui/skeleton";

/**
 * Mirrors PendingClientInvitationsList/ClientInvitationRow's shape. Unlike
 * ClientsSkeleton, this doesn't render its own Card — it's only ever used
 * inside the "Pending invitations" Card's CardContent in
 * clients-container.tsx, which keeps its header visible while loading
 * (same pattern as InvitationsSkeleton in features/team).
 */
export function ClientInvitationsSkeleton() {
  return (
    <div className="divide-border -mx-6 flex flex-col divide-y">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-6 py-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
