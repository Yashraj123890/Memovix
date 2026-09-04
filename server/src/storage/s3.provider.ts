import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
    StorageProvider,
    UploadInput,
    UploadResult,
} from "./storageProvider";

/**
 * Build a Content-Disposition value that forces a download and preserves the
 * original filename. Emits both a sanitized ASCII `filename` (fallback for old
 * clients) and an RFC 5987 `filename*` so Unicode names survive.
 */
function buildAttachmentDisposition(fileName: string): string {
    const asciiFallback = fileName.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "'");
    const encoded = encodeURIComponent(fileName);
    return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}

export class S3StorageProvider implements StorageProvider {

    private readonly s3Client: S3Client;
    private readonly bucketName: string;

    constructor() {

        this.bucketName = process.env.AWS_S3_BUCKET_NAME!;

        this.s3Client = new S3Client({
            region: process.env.AWS_REGION!,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });

    }

    async upload(
        input: UploadInput,
        key: string
    ): Promise<UploadResult> {

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: input.data,
            ContentType: input.contentType,
        });

        await this.s3Client.send(command);

        return {
            storageKey: key,
        };
    }

    async delete(
        storageKey: string
    ): Promise<void> {

        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: storageKey,
        });

        await this.s3Client.send(command);

    }

    async getSignedUrl(
        storageKey: string,
        options?: { downloadFileName?: string; expiresInSeconds?: number }
    ): Promise<string> {

        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: storageKey,
            ...(options?.downloadFileName
                ? {
                      ResponseContentDisposition: buildAttachmentDisposition(
                          options.downloadFileName
                      ),
                  }
                : {}),
        });

        return getSignedUrl(
            this.s3Client,
            command,
            {
                expiresIn: options?.expiresInSeconds ?? 60 * 15,
            }
        );

    }

    async download(
        storageKey: string
    ): Promise<Buffer> {

        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: storageKey,
        });

        const response = await this.s3Client.send(command);

        if (!response.Body) {
            throw new Error("S3 object has no body");
        }

        // AWS SDK v3 returns a Node.js Readable stream here.
        const stream = response.Body as unknown as AsyncIterable<Uint8Array>;
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }

        return Buffer.concat(chunks);
    }

}