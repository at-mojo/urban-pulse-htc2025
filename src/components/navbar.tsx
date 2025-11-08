"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { UserAvatar, useUser } from "@stackframe/stack";
export const NavBar = () => {
  const user = useUser();
  const pathname = usePathname();

  const isLoggedIn = user !== null;

  const links = [
    {
      show: !isLoggedIn,
      href: "/handler/sign-up",
      label: <UserAvatar user={user} />,
    },
    {
      show: isLoggedIn,
      href: "/handler/sign-out",
      label: <UserAvatar user={user} />,
    },
    {
      show: isLoggedIn,
      href: "/dashboard",
      label: "Dashboard",
    },
  ];
  return (
    <nav className="fixed top-0 left-0 w-full bg-background/50 backdrop-blur-lg z-50 flex flex-row items-center justify-between">
      <Link href="/">
        <h1 className="text-4xl font-departure-mono text-foreground p-4">
          Urban Pulse |{" "}
          <span className="text-2xl text-foreground/50">City of Calgary</span>
        </h1>
      </Link>
      <div className="flex flex-row items-center justify-center gap-4 pr-4">
        {links.map(
          (link) =>
            link.show &&
            (typeof link.label === "string" ? (
              <Button variant="ghost" size="lg" asChild key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    pathname === link.href
                      ? "text-primary"
                      : "text-foreground/50",
                    "hover:text-primary"
                  )}
                >
                  {link.label}
                </Link>
              </Button>
            ) : (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))
        )}
      </div>
    </nav>
  );
};
