/**
 * Kicks off a browser download for a URL. For cross-origin signed URLs (S3),
 * the `download` attribute is ignored by browsers, so the URL itself must carry
 * Content-Disposition: attachment to actually download rather than navigate —
 * this just clicks a transient anchor to start it.
 */
export function triggerBrowserDownload(url: string, fileName: string): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
