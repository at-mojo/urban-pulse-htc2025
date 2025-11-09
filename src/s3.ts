"use client";

import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const AWS_REGION = process.env.NEXT_PUBLIC_AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;
const S3_BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;

if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !S3_BUCKET_NAME) {
  throw new Error("Missing required AWS environment variables");
}

export const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Initialize a multipart upload and return presigned URLs for parts.
 */
export async function initMultipartUpload({
  fileName,
  fileType,
  fileSize,
  partSize,
}: {
  fileName: string;
  fileType: string;
  fileSize: number;
  partSize?: number;
}) {
  if (!fileName || !fileType || !fileSize) {
    throw new Error("fileName, fileType and fileSize required");
  }

  const key = `uploads/${Date.now()}-${fileName}`;

  const createCmd = new CreateMultipartUploadCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const createRes = await s3.send(createCmd);
  const uploadId = createRes.UploadId;
  if (!uploadId) throw new Error("Failed to create multipart upload");

  const partSz = partSize || 5 * 1024 * 1024; // default 5MB
  const partsCount = Math.ceil(fileSize / partSz);

  const parts: { partNumber: number; uploadUrl: string }[] = [];
  for (let i = 1; i <= partsCount; i++) {
    const uploadPartCmd = new UploadPartCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      PartNumber: i,
      UploadId: uploadId,
    });
    const uploadUrl = await getSignedUrl(s3, uploadPartCmd, {
      expiresIn: 3600,
    });
    parts.push({ partNumber: i, uploadUrl });
  }

  const fileUrl = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
  return { uploadId, key, parts, fileUrl };
}

/**
 * Upload file parts using presigned URLs.
 * Returns an array of parts with ETags ready for completing the multipart upload.
 */
export async function uploadFileParts(
  file: File,
  parts: { partNumber: number; uploadUrl: string }[],
  partSize: number,
  onProgress?: (progress: number) => void
): Promise<{ ETag: string; PartNumber: number }[]> {
  if (!file || !parts || parts.length === 0) {
    throw new Error("file and parts are required");
  }

  const uploadedParts = await Promise.all(
    parts.map(async (part) => {
      const start = (part.partNumber - 1) * partSize;
      const end = Math.min(start + partSize, file.size);
      const chunk = file.slice(start, end);

      const uploadResponse = await fetch(part.uploadUrl, {
        method: "PUT",
        body: chunk,
      });

      if (!uploadResponse.ok) {
        throw new Error(
          `Failed to upload part ${part.partNumber}: ${uploadResponse.statusText}`
        );
      }

      const etag = uploadResponse.headers.get("ETag");
      if (!etag) {
        throw new Error(`No ETag received for part ${part.partNumber}`);
      }

      // Update progress if callback provided
      if (onProgress) {
        onProgress((part.partNumber / parts.length) * 99);
      }

      return {
        ETag: etag.replace(/['"]/g, ""), // Remove quotes from ETag
        PartNumber: part.partNumber,
      };
    })
  );

  return uploadedParts;
}

/**
 * Complete a multipart upload given the uploadId, key and parts (with ETag and PartNumber).
 */
export async function completeMultipartUpload({
  uploadId,
  key,
  parts,
}: {
  uploadId: string;
  key: string;
  parts: { ETag: string; PartNumber: number }[];
}) {
  if (!uploadId || !key || !parts)
    throw new Error("uploadId, key and parts required");

  const completeCmd = new CompleteMultipartUploadCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: parts.map((p) => ({ ETag: p.ETag, PartNumber: p.PartNumber })),
    },
  });

  const res = await s3.send(completeCmd);
  const fileUrl = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
  console.log("File Key:", key);
  return { res, fileUrl };
}

/**
 * Abort a multipart upload
 */
export async function abortMultipartUpload({
  uploadId,
  key,
}: {
  uploadId: string;
  key: string;
}) {
  if (!uploadId || !key) throw new Error("uploadId and key required");

  const abortCmd = new AbortMultipartUploadCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    UploadId: uploadId,
  });

  await s3.send(abortCmd);
  return { ok: true };
}
