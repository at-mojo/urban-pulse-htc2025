"use client";

import { AlertCircleIcon, ImageUpIcon, XIcon } from "lucide-react";
import Image from "next/image";

import { useFileUpload } from "@/hooks/use-file-upload";
import { useEffect, useState } from "react";
import {
  completeMultipartUpload,
  initMultipartUpload,
  uploadFileParts,
} from "@/s3";
import { generateDescription } from "@/ollama";
import { createId } from "@paralleldrive/cuid2";

export default function Uploader({
  setImagePath,
  setSuggestion,
}: {
  setImagePath: (path: string) => void;
  setSuggestion: (suggestion: string) => void;
}) {
  const [progress, setProgress] = useState(0);
  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
  });

  const multipartUpload = async (file: File) => {
    try {
      setProgress(0);
      const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

      const { uploadId, key, parts } = await initMultipartUpload({
        fileName: `${createId()}.${file.name.split(".").pop()}`,
        fileType: file.type,
        fileSize: file.size,
        partSize: CHUNK_SIZE,
      });

      const uploadedParts = await uploadFileParts(
        file,
        parts,
        CHUNK_SIZE,
        setProgress
      );

      const result = await completeMultipartUpload({
        uploadId,
        key,
        parts: uploadedParts,
      });

      setProgress(100);
      setSuggestion("Generating description...");
      setImagePath(result.fileUrl.split(".com/")[1]);
      generateDescription({ imagePath: result.fileUrl.split(".com/")[1] })
      .then((res) => {
        setSuggestion(res.content);
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      setProgress(0);
    }
  };

  const previewUrl = files[0]?.preview || null;
  // biome-ignore lint/correctness/useExhaustiveDependencies: We don't want to keep rerendering on multipartUpload fn change
  useEffect(() => {
    if (files[0]?.file) {
      console.log("Uploading file:", files[0]?.file);
      multipartUpload(files[0]?.file as File);
    }
  }, [files[0]?.file]);
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative w-full">
        {/* Drop area */}
        <button
          type="button"
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          data-dragging={isDragging || undefined}
          className="relative w-full flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-input p-4 transition-colors hover:bg-accent/50 has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
        >
          <input
            {...getInputProps()}
            className="sr-only"
            aria-label="Upload file"
          />
          {previewUrl ? (
            <div className="absolute inset-0">
              {progress > 0 && progress < 100 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                  <p>{progress}%</p>
                </div>
              )}
              <Image
                src={previewUrl}
                alt={files[0]?.file?.name || "Uploaded image"}
                className="size-full object-cover"
                width={100}
                height={100}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                aria-hidden="true"
              >
                <ImageUpIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">
                Drop your image here or click to browse
              </p>
            </div>
          )}
        </button>
        {previewUrl && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              className="z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onClick={() => removeFile(files[0]?.id)}
              aria-label="Remove image"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div
          className="flex items-center gap-1 text-xs text-destructive"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}
    </div>
  );
}
