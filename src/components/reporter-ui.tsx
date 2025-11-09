import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { RadioGroup } from "./ui/radio-group";

export const ReporterUI = () => {
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        className="absolute bottom-8 right-2 rounded-md p-4 z-50 text-white bg-rose-400/50 hover:bg-rose-400/70"
        onClick={() => setIsNewReportModalOpen(true)}
      >
        <PlusIcon color="white" style={{ width: "18px", height: "18px" }} />
        <span className="text-lg">Create Report</span>
      </Button>
      {isNewReportModalOpen && (
        <NewReportModal setIsNewReportModalOpen={setIsNewReportModalOpen} />
      )}
    </>
  );
};

export const NewReportModal = ({
  setIsNewReportModalOpen,
}: {
  setIsNewReportModalOpen: (isOpen: boolean) => void;
}) => {
  const [urgency, setUrgency] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  return createPortal(
    <div className="absolute top-0 left-0 w-full h-full bg-background/90 z-50">
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="bg-background rounded-md p-4 flex flex-col gap-4 w-2xl max-w-[90vw] relative border-border border-2 shadow-2xl">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4"
            onClick={() => setIsNewReportModalOpen(false)}
          >
            <XIcon color="white" style={{ width: "18px", height: "18px" }} />
          </Button>
          <h1 className="text-2xl font-bold font-departure-mono ">
            New Report
          </h1>
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
            placeholder="Description"
            className="resize-none"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex flex-row -mx-4 -mb-4">
            <Button
              variant="outline"
              className="flex-1 -mx-px rounded-r-none rounded-t-none h-12 border-none"
              onClick={() => setIsNewReportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="flex-1 -mx-px rounded-l-none rounded-t-none h-12 border-none"
            >
              Create Report
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
