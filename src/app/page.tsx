"use client";

import { useEffect, useState } from "react";
import { MouseIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";

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
      <div className="w-screen h-screen flex items-center justify-center relative overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0 blur-lg brightness-[0.2] grayscale"
          src={`https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/herobg1.mp4`}
          autoPlay
          preload="auto"
          loop
          muted
          playsInline
        ></video>
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
          <h1 className="text-5xl font-bold font-departure-mono text-foreground animate-pulse">
            Urban Pulse
          </h1>
          <MouseIcon
            className={cn(
              "w-10 h-10 text-foreground absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce transition-opacity duration-300",
              isNotAtY0 ? "opacity-0" : "opacity-100"
            )}
          />
          <BlurFade
            className="absolute bottom-5 left-1/2 -translate-x-1/2 text-foreground/50 font-departure-mono text-sm"
            delay={1}
          >
            <span>scroll down</span>
          </BlurFade>
        </div>
      </div>
      <div className="w-screen h-screen flex flex-col items-center justify-center relative gap-4">
        {isNotAtY0 && (
          <>
            <BlurFade delay={0.5}>
              <div className="font-departure-mono">
                <p>
                  The beating heart of a city is its people.
                </p>
              </div>
            </BlurFade>
            <BlurFade delay={0.75}>
              <div className="font-departure-mono">
                <p>
                  Inform local government and businesses of issues in your community. Help make your city a better place.
                </p>
              </div>
            </BlurFade>
            <BlurFade delay={1}>
              <Button
                variant="ghost"
                size="lg"
                asChild
                className="font-departure-mono text-2xl p-6"
              >
                <Link href="/handler/sign-in">
                  <h1>Get Started</h1>
                </Link>
              </Button>
            </BlurFade>
          </>
        )}
      </div>
    </main>
  );
}
