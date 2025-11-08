"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { cn } from "@/lib/util";
import { stackClientApp } from "@/stack/client";
import { useState, useEffect } from "react";
import { UserAvatar, type CurrentUser } from "@stackframe/stack";
export const NavBar = () => {
  const [user, setUser] = useState<CurrentUser | undefined>(undefined);
  useEffect(() => {
    stackClientApp.getUser().then((user: CurrentUser | null) => {
      setUser(user as CurrentUser);
    });
  }, []);
  const pathname = usePathname();

  const isLoggedIn = user !== null;

  const links = [
    {
      show: true,
      href: "/",
      label: "Home",
    },
    {
      show: !isLoggedIn,
      href: "/handler/sign-up",
      label: <UserAvatar user={user as CurrentUser} />,
    },
    {
      show: isLoggedIn,
      href: "/handler/sign-out",
      label: <UserAvatar user={user as CurrentUser} />,
    },
  ];
  return (
    <nav className="fixed top-0 left-0 w-full bg-background/50 backdrop-blur-lg z-50 flex flex-row items-center justify-between">
      <h1 className="text-4xl font-bytesized text-foreground p-4">
        Urban Pulse |{" "}
        <span className="text-2xl text-foreground/50">City of Calgary</span>
      </h1>
      <div className="flex flex-row items-center justify-center gap-4 pr-4">
        {links.map((link) =>
          link.show && (typeof link.label === "string" ? (
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
