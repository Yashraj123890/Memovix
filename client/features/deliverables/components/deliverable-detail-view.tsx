"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  CalendarIcon,
  DownloadIcon,
  EyeIcon,
  PaperclipIcon,
  PencilIcon,
  SendIcon,
  Share2Icon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useDeliverableQuery } from "@/features/deliverables/hooks/use-deliverable-query";
import { useUpdateDeliverableMutation } from "@/features/deliverables/hooks/use-update-deliverable-mutation";
import { useRevisionRequestsQuery } from "@/features/deliverables/hooks/use-revision-requests-query";
import { useVersionDownload } from "@/features/deliverables/hooks/use-version-download";
import { DeliverableStatusBadge } from "@/features/deliverables/components/deliverable-status-badge";
import { DeliverableFormDialog } from "@/features/deliverables/components/deliverable-form-dialog";
import { UploadVersionDialog } from "@/features/deliverables/components/upload-version-dialog";
import { DeleteDeliverableDialog } from "@/features/deliverables/components/delete-deliverable-dialog";
import { DeliverableReviewPanel } from "@/features/deliverables/components/deliverable-review-panel";
import { DeliverableVersionHistory } from "@/features/deliverables/components/deliverable-version-history";
import { DeliverableActivity } from "@/features/deliverables/components/deliverable-activity";
import { getFileTypeConfig } from "@/features/files/config/file-type";
import { formatBytes } from "@/utils/format-bytes";
import { getErrorMessage } from "@/utils/error";
import type { DeliverableDetail, DeliverableStatus, DeliverableVersion } from "@/types/deliverable";

interface DeliverableDetailViewProps {
  projectId: string;
  deliverableId: string;
}

type DetailTab = "overview" | "versions" | "details";

function formatDate(iso: string | null): string {
  if (!iso) return "Not set";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** "6 days remaining" / "Due today" / "3 days overdue" */
function dueHint(iso: string | null): string | null {
  if (!iso) return null;
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(new Date(iso)) - startOfDay(new Date())) / 86_400_000);
  if (days === 0) return "Due today";
  if (days > 0) return `${days} day${days === 1 ? "" : "s"} remaining`;
  const overdue = Math.abs(days);
  return `${overdue} day${overdue === 1 ? "" : "s"} overdue`;
}

const ROLE_TITLE: Record<string, string> = {
  OWNER: "Owner",
  MEMBER: "Member",
  CLIENT: "Client",
};

const STATUS_DOT: Record<DeliverableStatus, string> = {
  DRAFT: "bg-primary",
  SUBMITTED: "bg-info",
  APPROVED: "bg-success",
  REVISION_REQUESTED: "bg-warning",
};

const STATUS_HINT: Record<DeliverableStatus, string> = {
  DRAFT: "Not yet submitted for review",
  SUBMITTED: "Waiting for client review",
  APPROVED: "Signed off by the client",
  REVISION_REQUESTED: "Changes requested by the client",
};

export function DeliverableDetailView({ projectId, deliverableId }: DeliverableDetailViewProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const role = user?.role;
  const canManage = role === "OWNER" || role === "MEMBER";
  const isClient = role === "CLIENT";

  const { data: deliverable, isLoading, isError, error, refetch } =
    useDeliverableQuery(deliverableId);
  const updateDeliverable = useUpdateDeliverableMutation(projectId, deliverableId);
  const { data: revisionRequests } = useRevisionRequestsQuery(deliverableId);
  const versionDownload = useVersionDownload(deliverableId);

  const [tab, setTab] = useState<DetailTab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return <LoadingState label="Loading deliverable..." />;
  }

  if (isError || !deliverable) {
    return <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />;
  }

  const latestVersion = pickLatestVersion(deliverable);
  const hasVersions = deliverable.versions.length > 0;
  const latestRevision = revisionRequests?.[0] ?? null;

  // Owner/member guidance so the DRAFT -> SUBMITTED step (which unlocks the
  // client's review) is never a mystery.
  const manageHint =
    deliverable.status === "DRAFT"
      ? hasVersions
        ? "This is a draft. Submit it for review so the client can approve or request changes."
        : "Upload a version first, then submit this deliverable for review."
      : deliverable.status === "SUBMITTED"
        ? "Submitted — waiting for the client to review."
        : deliverable.status === "REVISION_REQUESTED"
          ? "The client requested changes. Upload a new version, then resubmit for review."
          : "Approved by the client.";

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;
    if (!navigator.clipboard?.writeText) {
      toast.error("Copying isn’t supported in this browser");
      return;
    }
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Couldn’t copy the link"));
  }

  function handleSubmitForReview() {
    updateDeliverable.mutate(
      { status: "SUBMITTED" },
      { onSuccess: () => toast.success("Submitted for review") },
    );
  }

  function handleMoveToDraft() {
    updateDeliverable.mutate(
      { status: "DRAFT" },
      { onSuccess: () => toast.success("Moved back to draft") },
    );
  }

  const tabs: { value: DetailTab; label: string }[] = [
    { value: "overview", label: "Overview" },
    { value: "versions", label: "Version History" },
    { value: "details", label: "Details" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/projects/${projectId}/deliverables`}
        className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 text-sm"
      >
        <ArrowLeftIcon className="size-4" aria-hidden="true" />
        Back to Deliverables
      </Link>

      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-foreground text-2xl font-semibold break-words">
              {deliverable.title}
            </h1>
            <DeliverableStatusBadge status={deliverable.status} />
          </div>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {deliverable.dueDate ? <>Due {formatDate(deliverable.dueDate)} · </> : null}
            Created {formatDate(deliverable.createdAt)}
            {deliverable.createdBy?.name ? ` by ${deliverable.createdBy.name}` : ""}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasVersions}
            loading={versionDownload.isDownloadingAll}
            onClick={() => versionDownload.downloadAll(deliverable.versions)}
          >
            <DownloadIcon className="size-4" aria-hidden="true" />
            Download All
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2Icon className="size-4" aria-hidden="true" />
            Share
          </Button>
          {canManage && (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <PencilIcon className="size-4" aria-hidden="true" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2Icon className="size-4" aria-hidden="true" />
                Delete
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Sub-tabs */}
      <nav
        className="border-border flex min-w-0 max-w-full items-center gap-4 overflow-x-auto border-b"
        aria-label="Deliverable sections"
      >
        {tabs.map((item) => {
          const isActive = tab === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              className={cn(
                "-mb-px border-b-2 px-1 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          {tab === "overview" && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Latest Version</CardTitle>
                  {latestVersion && (
                    <Badge variant="info" className="px-1.5 py-0">
                      v{latestVersion.versionNumber}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  {latestVersion ? (
                    <LatestVersionBlock
                      version={latestVersion}
                      onPreview={() => versionDownload.preview(latestVersion.id)}
                      onDownload={() => versionDownload.download(latestVersion.id)}
                      isPreviewing={versionDownload.isPreviewing(latestVersion.id)}
                      isDownloading={versionDownload.isDownloading(latestVersion.id)}
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No version has been uploaded yet.
                    </p>
                  )}
                </CardContent>
              </Card>

              {isClient && (
                <DeliverableReviewPanel
                  projectId={projectId}
                  deliverableId={deliverableId}
                  title={deliverable.title}
                  status={deliverable.status}
                  approvedAt={deliverable.approvedAt}
                  latestRevisionComment={latestRevision?.comment ?? null}
                />
              )}

              {canManage && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Manage</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <p className="text-muted-foreground text-sm">{manageHint}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {(deliverable.status === "DRAFT" ||
                        deliverable.status === "REVISION_REQUESTED") && (
                        <Button
                          size="sm"
                          loading={updateDeliverable.isPending}
                          disabled={!hasVersions || updateDeliverable.isPending}
                          onClick={handleSubmitForReview}
                        >
                          <SendIcon className="size-4" aria-hidden="true" />
                          {deliverable.status === "DRAFT"
                            ? "Submit for review"
                            : "Resubmit for review"}
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setUploadOpen(true)}>
                        <UploadIcon className="size-4" aria-hidden="true" />
                        Upload version
                      </Button>
                      {deliverable.status === "SUBMITTED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updateDeliverable.isPending}
                          onClick={handleMoveToDraft}
                        >
                          Move back to draft
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {deliverable.description ? (
                    <p className="text-foreground/90 text-sm whitespace-pre-wrap">
                      {deliverable.description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm">No description provided.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <CardTitle className="text-base">Attachments</CardTitle>
                  <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                    <PaperclipIcon className="size-3.5" aria-hidden="true" />0
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">No attachments.</p>
                </CardContent>
              </Card>
            </>
          )}

          {tab === "versions" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Version History</CardTitle>
              </CardHeader>
              <CardContent>
                <DeliverableVersionHistory
                  deliverableId={deliverableId}
                  versions={deliverable.versions}
                  currentVersionId={deliverable.currentVersionId}
                />
              </CardContent>
            </Card>
          )}

          {tab === "details" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailItem label="Title" value={deliverable.title} />
                  <DetailItem label="Status" value={STATUS_HINT[deliverable.status]} />
                  <DetailItem label="Created" value={formatDate(deliverable.createdAt)} />
                  <DetailItem label="Due date" value={formatDate(deliverable.dueDate)} />
                  <DetailItem
                    label="Created by"
                    value={deliverable.createdBy?.name ?? "Unknown"}
                  />
                  <DetailItem
                    label="Versions"
                    value={`${deliverable.versions.length} uploaded`}
                  />
                </dl>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex items-start gap-2.5">
                <span
                  className={cn("mt-1.5 size-2 shrink-0 rounded-full", STATUS_DOT[deliverable.status])}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-medium">
                    <DeliverableStatusBadge status={deliverable.status} />
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {STATUS_HINT[deliverable.status]}
                  </p>
                </div>
              </div>

              <SidebarSection label="Assigned To">
                <div className="flex items-center gap-2.5">
                  <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                    {initials(user?.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-foreground text-sm font-medium">
                      You ({ROLE_TITLE[role ?? ""] ?? "Reviewer"})
                    </p>
                    {user?.name && (
                      <p className="text-muted-foreground truncate text-xs">{user.name}</p>
                    )}
                  </div>
                </div>
              </SidebarSection>

              <SidebarSection label="Due Date">
                <p className="text-foreground flex items-center gap-1.5 text-sm">
                  <CalendarIcon className="text-muted-foreground size-4" aria-hidden="true" />
                  {formatDate(deliverable.dueDate)}
                </p>
                {dueHint(deliverable.dueDate) && (
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {dueHint(deliverable.dueDate)}
                  </p>
                )}
              </SidebarSection>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <DeliverableActivity
                deliverable={deliverable}
                revisionRequests={revisionRequests ?? []}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {canManage && (
        <>
          <DeliverableFormDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            projectId={projectId}
            deliverable={deliverable}
          />
          <UploadVersionDialog
            open={uploadOpen}
            onOpenChange={setUploadOpen}
            projectId={projectId}
            deliverableId={deliverableId}
            nextVersionNumber={deliverable.versions.length + 1}
          />
          <DeleteDeliverableDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            projectId={projectId}
            deliverable={deliverable}
            onDeleted={() => router.push(`/projects/${projectId}/deliverables`)}
          />
        </>
      )}
    </div>
  );
}

/** The latest version — prefers the denormalized currentVersion, else the newest by number. */
function pickLatestVersion(deliverable: DeliverableDetail): DeliverableVersion | null {
  if (deliverable.currentVersion) return deliverable.currentVersion;
  return deliverable.versions[0] ?? null;
}

function initials(name?: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function LatestVersionBlock({
  version,
  onPreview,
  onDownload,
  isPreviewing,
  isDownloading,
}: {
  version: DeliverableVersion;
  onPreview: () => void;
  onDownload: () => void;
  isPreviewing: boolean;
  isDownloading: boolean;
}) {
  const { icon: FileTypeIcon, label } = getFileTypeConfig(version.originalName);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        Submitted on {formatDate(version.uploadedAt)}
        {version.uploadedBy?.name ? ` by ${version.uploadedBy.name}` : ""}
      </p>

      {version.changeSummary && (
        <p className="text-foreground/90 text-sm whitespace-pre-wrap">{version.changeSummary}</p>
      )}

      <div className="border-border flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-destructive/10 text-destructive flex size-9 shrink-0 items-center justify-center rounded-md">
            <FileTypeIcon className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-medium" title={version.originalName}>
              {version.originalName}
            </p>
            <p className="text-muted-foreground text-xs">
              {label} · {formatBytes(version.size)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="text" size="sm" loading={isPreviewing} onClick={onPreview}>
            <EyeIcon className="size-4" aria-hidden="true" />
            Preview
          </Button>
          <Button variant="text" size="sm" loading={isDownloading} onClick={onDownload}>
            <DownloadIcon className="size-4" aria-hidden="true" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}

function SidebarSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-muted-foreground text-xs font-medium">{label}</span>
      {children}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-foreground text-sm break-words">{value}</dd>
    </div>
  );
}
