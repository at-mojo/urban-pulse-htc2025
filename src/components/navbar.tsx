"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { UserAvatar, useUser } from "@stackframe/stack";
import logo from "@/logo.png";
import Image from "next/image";
export const NavBar = () => {
  const user = useUser();
  const pathname = usePathname();

  const isLoggedIn = user !== null;
  const isShown = pathname !== "/" && !pathname.startsWith("/handler");
  if (!isShown) {
    return null;
  }

  const links = [
    {
      show: isLoggedIn,
      href: "/dashboard",
      label: "Dashboard",
    },
    {
      show: !isLoggedIn,
      href: "/handler/sign-in",
      label: "Sign In",
    },
    {
      show: isLoggedIn,
      href: "/handler/sign-out",
      label: "Sign Out",
    },
  ];
  return (
    <nav className="fixed top-0 left-0 w-full bg-background/50 backdrop-blur-lg z-50 flex flex-row items-center justify-between">
      <Link href="/">
        <Image src={logo} alt="Urban Pulse" width={100} height={100} unoptimized />
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
        <UserAvatar user={user} />
      </div>
    </nav>
  );
};
