"use client";

import {
  Hotel,
  LayoutDashboard,
  LogIn,
  MapPin,
  Menu,
  Tag,
  UserPlus,
  UserRound,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserDropdown from "./user-dropdown";
import { SessionPayLoad } from "@/lib/session";

type HeaderProps = {
  session: SessionPayLoad | null;
};

export default function Header({ session }: HeaderProps) {
  const isLoggedIn = !!session;

  const navigations = [
    { label: "Hotels", link: "/hotels", icon: Hotel },
    { label: "Destinations", link: "/destinations", icon: MapPin },
    { label: "Deals", link: "/deals", icon: Tag },
  ];

  return (
    <header className="relative z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold">H</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Hotel GO
          </span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden items-center gap-1 md:flex">
          {navigations.map((navigation, index) => {
            const IconComponent = navigation.icon;
            return (
              <Link
                key={index}
                href={navigation.link}
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <IconComponent size={20} />
                {navigation.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <UserDropdown user={session} />
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="gap-2">
                  <UserRound className="size-4" />
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-booking text-booking-foreground hover:bg-booking/90">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
