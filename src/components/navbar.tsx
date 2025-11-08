"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { cn } from "@/lib/util";
export const NavBar = () => {
  const pathname = usePathname();

  const links = [
    {
      href: "/",
      label: "Home",
    },
    {
      href: "/handler/sign-up",
      label: "Sign Up",
    },
  ];
  return (
    <nav className="fixed top-0 left-0 w-full bg-background/50 backdrop-blur-lg z-50 flex flex-row items-center justify-between">
      <h1 className="text-4xl font-bytesized text-foreground p-4">
        Urban Pulse |{" "}
        <span className="text-2xl text-foreground/50">City of Calgary</span>
      </h1>
      <div className="flex flex-row items-center justify-center gap-4 pr-4">
        {links.map((link) => (
          <Button variant="ghost" size="lg" asChild key={link.href}>
            <Link
              href={link.href}
              className={cn(
                pathname === link.href ? "text-primary" : "text-foreground/50",
                "hover:text-primary"
              )}
            >
              {link.label}
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
};
