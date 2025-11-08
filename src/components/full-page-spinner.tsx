"use client";

import { Loader2Icon } from "lucide-react";

export const FullPageSpinner = () => {
  return (
    <div className="h-screen w-screen absolute top-0 left-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-lg animate-pulse rounded-full"><Loader2Icon className="w-10 h-10 animate-spin" /></div>
  );
};