"use client";

import { useState } from "react";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export default function TestUpload() {
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const uploadPart = async (
    url: string,
    chunk: Blob,
    partNumber: number,
    retries = 3
  ): Promise<{ ETag: string; PartNumber: number }> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const uploadResponse = await fetch(url, {
          method: "PUT",
          body: chunk,
          // Remove Content-Type header as it may cause issues with signed URLs
        });

        if (!uploadResponse.ok) {
          throw new Error(`HTTP ${uploadResponse.status}: ${uploadResponse.statusText}`);
        }

        const etag = uploadResponse.headers.get("ETag");
        if (!etag) {
          throw new Error("No ETag in response");
        }

        return {
          ETag: etag.replace(/['"]/g, ""),
          PartNumber: partNumber,
        };
      } catch (err) {
        console.error(`Part ${partNumber} attempt ${attempt} failed:`, err);
        if (attempt === retries) throw err;
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw new Error("Unreachable");
  };

  const uploadFile = async (file: File) => {
    let uploadId: string | undefined;
    let key: string | undefined;

    try {
      setStatus("Initiating upload...");
      setError(null);
      setProgress(0);

      // Initialize multipart upload
      const initResponse = await fetch("/api/upload-multipart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          partSize: CHUNK_SIZE,
        }),
      });

      if (!initResponse.ok) {
        const errorData = await initResponse.json().catch(() => ({}));
        throw new Error(`Init failed: ${errorData.error || initResponse.statusText}`);
      }

      const initData = await initResponse.json();
      ({ uploadId, key } = initData);
      console.log("Upload initialized:", { uploadId, key, parts: initData.parts.length });

      // Upload parts
      const uploadPromises = initData.parts.map(async (part: any) => {
        const start = (part.partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        try {
          const result = await uploadPart(part.uploadUrl, chunk, part.partNumber);
          setProgress((prev) => Math.min(prev + (100 / initData.parts.length), 99));
          return result;
        } catch (err) {
          throw new Error(`Part ${part.partNumber} failed: ${err.message}`);
        }
      });

      setStatus("Uploading...");
      const uploadedParts = await Promise.all(uploadPromises);

      // Complete upload
      setStatus("Completing upload...");
      const completeResponse = await fetch("/api/upload-multipart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, key, parts: uploadedParts }),
      });

      if (!completeResponse.ok) {
        throw new Error("Failed to complete upload");
      }

      setStatus("Upload complete!");
      setImageUrl(initData.fileUrl);
      setProgress(100);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
      setStatus("Failed!");
      setProgress(0);

      // Cleanup on failure
      if (uploadId && key) {
        await fetch("/api/upload-multipart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uploadId, key }),
        }).catch(console.error);
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">S3 Multipart Upload Test</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
        }}
        className="mb-4 p-2 border rounded"
      />

      <div className="text-sm mb-4">
        <div className={status === "Failed!" ? "text-red-600" : "text-gray-600"}>{status}</div>
        {progress > 0 && <div>Progress: {progress}%</div>}
        {error && <div className="text-red-600 mt-2">Error: {error}</div>}
      </div>

      {imageUrl && (
        <div>
          <p className="mb-2">Uploaded image:</p>
          <img
            src={imageUrl}
            alt="Uploaded"
            className="max-w-md rounded shadow"
            onError={() => setError("Failed to load uploaded image")}
          />
        </div>
      )}
    </div>
  );
}