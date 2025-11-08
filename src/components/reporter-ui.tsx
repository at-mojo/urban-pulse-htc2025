import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { createPortal } from "react-dom";

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
  return createPortal(
    <div className="absolute top-0 left-0 w-full h-full bg-background/50 backdrop-blur-xl z-50">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4"
        onClick={() => setIsNewReportModalOpen(false)}
      >
        <XIcon color="white" style={{ width: "18px", height: "18px" }} />
      </Button>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="bg-background rounded-md p-4">
          <h1 className="text-2xl font-bold font-bytesized ">New Report</h1>
        </div>
      </div>
    </div>,
    document.body
  );
};
