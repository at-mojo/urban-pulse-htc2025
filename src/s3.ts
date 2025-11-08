import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";

import { NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

console.log("Initializing S3 client with config:", {
  region: process.env.AWS_REGION,
  bucket: process.env.S3_BUCKET_NAME,
});

const requiredEnv = ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "S3_BUCKET_NAME"];
for (const v of requiredEnv) {
  if (!process.env[v]) throw new Error(`Missing env ${v}`);
}

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

