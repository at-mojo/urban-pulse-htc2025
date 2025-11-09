import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { RadioGroup } from "./ui/radio-group";
import { cn } from "@/lib/utils";
import { GlMap } from "./gl-map";
import Uploader from "./uploader";
import { createReport, updateReport } from "@/report";
import type { Report, Urgency } from "@prisma/client";
import Image from "next/image";

export const ReporterUI = ({ fetchReports }: { fetchReports: () => void }) => {
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "absolute bottom-8 right-2 rounded-full p-4 z-50 text-white bg-rose-400/50 hover:bg-rose-400/70 h-15 group flex flex-row items-center justify-start transition-all duration-300 overflow-hidden",
          !isHovering && "w-15",
          isHovering && "w-56"
        )}
        onClick={() => setIsNewReportModalOpen(true)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <PlusIcon color="white" style={{ width: "32px", height: "32px" }} />
        <span className="text-lg font-departure-mono group-hover:opacity-100 opacity-0 transition-opacity duration-300">
          Create Report
        </span>
      </Button>
      {isNewReportModalOpen && (
        <ReportModal setModalOpen={setIsNewReportModalOpen} mode="new" fetchReports={fetchReports} />
      )}
    </>
  );
};

export const ReportModal = ({
  setModalOpen,
  mode,
  report,
  fetchReports,
}: {
  setModalOpen: (isOpen: boolean) => void;
  mode: "new" | "edit";
  report?: Report;
  fetchReports: () => void;
}) => {
  const [urgency, setUrgency] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [title, setTitle] = useState(mode === "new" ? "" : report?.title || "");
  const [description, setDescription] = useState(
    mode === "new" ? "" : report?.desc || ""
  );
  const [suggestion, setSuggestion] = useState("Description");
  const [submittableLocation, setSubmittableLocation] = useState(
    mode === "new" ? null : { lat: report?.lat || 0, lon: report?.lon || 0 }
  );
  const [imagePath, setImagePath] = useState<string | null>(null);
  return createPortal(
    <div className="absolute top-0 left-0 w-full h-full bg-background/90 z-50">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="bg-background rounded-md p-4 flex flex-col gap-4 w-2xl max-w-[90vw] relative border-border border-2 shadow-2xl overflow-y-auto max-h-[90vh] overflow-x-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={() => setModalOpen(false)}
          >
            <XIcon color="white" style={{ width: "18px", height: "18px" }} />
          </Button>
          <h1 className="text-xl font-bold font-departure-mono">
            {mode === "new" ? "New Report" : `Edit Report: ${report?.title}`}
          </h1>
          <label htmlFor="location" className="text-sm text-foreground/50">
            Location
          </label>
          <div className="min-h-80 h-80 w-full relative overflow-hidden rounded-md">
            <GlMap
              longitude={submittableLocation?.lon}
              latitude={submittableLocation?.lat}
              zoom={submittableLocation ? 17 : 11}
              onPinChange={(coords) => setSubmittableLocation(coords)}
              initialPin={submittableLocation || undefined}
              allowPinDrop={true}
            />
            {/* Hide Mapbox attribution because it gets in the way - not because we don't absolutely love mapbox <3 */}
            <style>
              {`
                .mapboxgl-ctrl-attrib-inner {
                  display: none !important;
                }
              `}
            </style>
          </div>
          <div className="w-full">
            {report?.path && (
              <label htmlFor="image" className="text-sm text-foreground/50">
                Image
              </label>
            )}

            {mode === "new" && (
              <Uploader
                setImagePath={setImagePath}
                setSuggestion={setSuggestion}
              />
            )}
            {mode === "edit" && report?.path && report?.path.trim() !== "" ? (
              <div className="text-sm text-foreground/50">
                <Image
                  src={`https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/${report?.path}`}
                  alt={report?.title || "Report Image"}
                  width={1000}
                  height={1000}
                  className="w-full h-full object-contain rounded-md"
                />
              </div>
            ) : null}
          </div>
          <label htmlFor="urgency" className="text-sm text-foreground/50">
            Urgency
          </label>
          <RadioGroup
            id="urgency"
            options={[
              { label: "Low", value: "LOW", color: "bg-green-400/50!" },
              { label: "Medium", value: "MEDIUM", color: "bg-yellow-400/50!" },
              { label: "High", value: "HIGH", color: "bg-red-400/50!" },
            ]}
            value={urgency}
            onChange={(value) => setUrgency(value as "LOW" | "MEDIUM" | "HIGH")}
          />
          <label htmlFor="title" className="text-sm text-foreground/50">
            Title <span className="text-red-400">*</span>
          </label>
          <Input
            id="title"
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label htmlFor="description" className="text-sm text-foreground/50">
            Description
          </label>
          <Textarea
            id="description"
            placeholder={suggestion}
            className="resize-none"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Tab" && !e.shiftKey) {
                e.preventDefault();
                setDescription(suggestion);
                setSuggestion("");
              }
            }}
          />
          <div className="flex flex-row -mx-4 -mb-4">
            <Button
              variant="outline"
              className="flex-1 -mx-px rounded-r-none rounded-t-none h-12 border-none"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="flex-1 -mx-px rounded-l-none rounded-t-none h-12 border-none"
              disabled={!submittableLocation || !title}
              onClick={async () => {
                // TODO: When editing, do the actual edit.
                if (submittableLocation) {
                  try {
                    if (mode === "new") {
                      const response = await createReport({
                        title,
                        desc: description,
                        lat: submittableLocation.lat,
                        lon: submittableLocation.lon,
                        path: imagePath || "",
                        urgency: urgency,
                      });
                      console.log(response);
                    } else {
                      const response = await updateReport({
                        reportId: report?.id || "",
                        title: title,
                        desc: description,
                        lat: submittableLocation.lat,
                        lon: submittableLocation.lon,
                        path: report?.path || "",
                        urgency: urgency as Urgency,
                      });
                      console.log(response);
                    }
                  } catch (error) {
                    console.error("Error creating/updating report:", error);
                  } finally {
                    setModalOpen(false);
                    fetchReports();
                  }
                }
              }}
            >
              {mode === "new" ? "Create Report" : "Save Report"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
