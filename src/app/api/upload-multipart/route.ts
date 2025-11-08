export async function POST(request: Request) {
  try {
    console.log("Received multipart upload request");
    const { fileName, fileType, fileSize, partSize } = await request.json();
    console.log("Request details:", { fileName, fileType, fileSize, partSize });

    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json({ error: "fileName, fileType and fileSize required" }, { status: 400 });
    }

    const key = `uploads/${Date.now()}-${fileName}`;
    console.log("Generated key:", key);

    const createCmd = new CreateMultipartUploadCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      // Removed ACL
    });

    console.log("Creating multipart upload...");
    const createRes = await s3.send(createCmd);
    console.log("Create response:", createRes);

    const uploadId = createRes.UploadId;
    if (!uploadId) {
      console.error("No uploadId received");
      return NextResponse.json({ error: "Failed to create multipart upload" }, { status: 500 });
    }

    // compute parts
    const partSz = partSize || 5 * 1024 * 1024; // default 5MB
    const partsCount = Math.ceil(fileSize / partSz);
    console.log("Generating presigned URLs for parts:", { partsCount, partSize: partSz });

    const parts: { partNumber: number; uploadUrl: string }[] = [];

    for (let i = 1; i <= partsCount; i++) {
      const uploadPartCmd = new UploadPartCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        PartNumber: i,
        UploadId: uploadId,
      });

      console.log(`Generating presigned URL for part ${i}...`);
      const uploadUrl = await getSignedUrl(s3, uploadPartCmd, { expiresIn: 3600 }); // 1 hour
      parts.push({ partNumber: i, uploadUrl });
    }

    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    console.log("Upload initialization complete:", { uploadId, fileUrl, partsCount: parts.length });

    return NextResponse.json({ uploadId, key, parts, fileUrl });
  } catch (err: any) {
    console.error("Multipart init error:", err);
    // Log full error details
    console.error("Full error:", JSON.stringify(err, null, 2));
    return NextResponse.json(
      {
        error: "Multipart init failed",
        details: err.message,
        code: err.code || "UNKNOWN",
        name: err.name,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  // complete multipart upload
  try {
    const { uploadId, key, parts } = await request.json();
    if (!uploadId || !key || !parts) {
      return NextResponse.json({ error: "uploadId, key and parts required" }, { status: 400 });
    }

    // parts must be array of { ETag, PartNumber }
    const completeCmd = new CompleteMultipartUploadCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((p: any) => ({ ETag: p.ETag, PartNumber: p.PartNumber })),
      },
    });

    const res = await s3.send(completeCmd);
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return NextResponse.json({ result: res, fileUrl });
  } catch (err: any) {
    console.error("Complete multipart error:", err);
    return NextResponse.json({ error: "Complete multipart failed", details: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // abort multipart upload
  try {
    const { uploadId, key } = await request.json();
    if (!uploadId || !key) {
      return NextResponse.json({ error: "uploadId and key required" }, { status: 400 });
    }

    const abortCmd = new AbortMultipartUploadCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      UploadId: uploadId,
    });

    await s3.send(abortCmd);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Abort multipart error:", err);
    return NextResponse.json({ error: "Abort failed", details: err.message }, { status: 500 });
  }
}