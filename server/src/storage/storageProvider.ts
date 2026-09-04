export interface UploadInput {
    data: Uint8Array;
    contentType: string;
}

export interface UploadResult {
    storageKey: string;
}

export interface StorageProvider {

    upload(
        input: UploadInput,
        key: string
    ): Promise<UploadResult>;

    delete(
        storageKey: string
    ): Promise<void>;

    /**
     * `options.downloadFileName`, when set, makes the signed URL force a
     * browser download (Content-Disposition: attachment) with that filename
     * instead of rendering inline. Needed because the URL is cross-origin
     * (S3), so the HTML `download` attribute is ignored and inline-rendered
     * types (PDF, images) would otherwise just open in a new tab.
     * `options.expiresInSeconds` overrides the default 15-minute expiry (e.g.
     * a longer-lived URL for an avatar that stays rendered in the header).
     */
    getSignedUrl(
        storageKey: string,
        options?: { downloadFileName?: string; expiresInSeconds?: number }
    ): Promise<string>;

    /** Fetch the raw object bytes (used by the ingestion pipeline). */
    download(
        storageKey: string
    ): Promise<Buffer>;

}