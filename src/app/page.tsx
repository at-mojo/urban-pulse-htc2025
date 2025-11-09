"use client";

import { useEffect, useState } from "react";
import { MouseIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isNotAtY0, setIsNotAtY0] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (window.scrollY !== 0) {
        setIsNotAtY0(true);
      } else {
        setIsNotAtY0(false);
      }
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center justify-center relative">
      <div className="w-screen h-screen flex items-center justify-center relative">
        <h1 className="text-5xl font-bold font-departure-mono text-foreground animate-pulse">
          Urban Pulse
        </h1>
        <MouseIcon
          className={cn(
            "w-10 h-10 text-foreground absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce transition-opacity duration-300",
            isNotAtY0 ? "opacity-0" : "opacity-100"
          )}
        />
      </div>
      <div className="w-screen h-screen flex items-center justify-center relative">
        <Button
          variant="ghost"
          size="lg"
          asChild
        >
          <Link href="/dashboard">
            <h1>Dashboard</h1>
          </Link>
        </Button>
      </div>
    </main>
  );
}
