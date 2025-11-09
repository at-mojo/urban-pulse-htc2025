import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import localFont from "next/font/local";
import "./globals.css";
import { NavBar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Suspense } from "react";
import { FullPageSpinner } from "@/components/full-page-spinner";

export const metadata: Metadata = {
  title: "Urban Pulse",
  description:
    "Urban Pulse is a platform for reporting urban issues in the City of Calgary.",
};

const departureMono = localFont({
  src: "../fonts/departure-mono.woff2",
  display: "swap",
  variable: "--font-departure-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`antialiased flex min-h-screen flex-col`}>
        <style>{`
          :root {
            --font-departure-mono: ${departureMono.style.fontFamily};
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
