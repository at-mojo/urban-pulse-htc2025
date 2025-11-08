import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import { Bytesized } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Suspense } from "react";
import { FullPageSpinner } from "@/components/full-page-spinner";

const bytesized = Bytesized({
  weight: "400",
});

export const metadata: Metadata = {
  title: "Urban Pulse",
  description:
    "Urban Pulse is a platform for reporting urban issues in the City of Calgary.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased flex min-h-screen flex-col dark`}>
        <style global>{`
          :root {
            --font-bytesized: ${bytesized.style.fontFamily};
          }
        `}</style>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <Suspense fallback={<FullPageSpinner />}>
              <NavBar />
            </Suspense>
            {children}
            <Footer />
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
