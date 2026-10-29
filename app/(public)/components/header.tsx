import {
  BriefcaseBusiness,
  MapPin,
  Search,
  Tag,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import UserDropdown from "./user-dropdown";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import Button from "@/components/common/button";
import InputField from "@/components/common/input-field";

async function HeaderContent() {
  const session = await getServerSession();
  const user = session?.user;

  const navigations = [
    {
      label: "Busniness",
      link: "/dashboard",
      icon: BriefcaseBusiness,
    },
    {
      label: "Destinations",
      link: "/destinations",
      icon: MapPin,
    },
    {
      label: "Offers",
      link: "/deals",
      icon: Tag,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Navigation */}
        <div className="flex min-h-12 items-center justify-between gap-4 border-b border-border/60">
          {/* Navigation */}
          <nav className="flex min-w-0 items-center gap-1 overflow-x-auto">
            {navigations.map((navigation) => {
              const IconComponent = navigation.icon;

              return (
                <Link
                  key={navigation.link}
                  href={navigation.link}
                  className="
                    inline-flex shrink-0 items-center gap-2
                    rounded-md px-3 py-2
                    text-sm font-medium text-foreground
                    transition-colors
                    hover:bg-primary/10 hover:text-primary
                  "
                >
                  <IconComponent size={16} />
                  <span>{navigation.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex shrink-0 items-center gap-2">
            {!!user ? (
              <UserDropdown
                user={
                  session.user
                    ? {
                        id_: session.user.id,
                        name: session.user.name ?? undefined,
                        email: session.user.email ?? undefined,
                      }
                    : null
                }
              />
            ) : (
              <>
                <Link href="/login">
                  <Button
                    leftIcon={<UserRound className="size-4" />}
                    variant="ghost"
                  >
                    Sign In
                  </Button>
                </Link>

                <Link href="/register">
                  <Button className="bg-black text-booking-foreground hover:bg-gray-900/90">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Main Header */}
        <div className="flex min-h-20 items-center justify-between gap-8 py-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">H</span>
            </div>

            <span className="text-xl font-bold tracking-tight text-foreground">
              Hotel GO
            </span>
          </Link>

          {/* Search */}
          <form
            action="/properties"
            method="GET"
            className="flex min-w-0 flex-1 items-center gap-2"
          >
            <div className="min-w-0 flex-1">
              <InputField
                id="hotel-search"
                name="search"
                placeholder="Search hotels, destinations..."
                className="h-10"
              />
            </div>

            <Button
              type="submit"
              className="h-10 bg-booking hover:bg-booking/90"
            >
              <Search />
              Search
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

export default function Header() {
  return (
    <Suspense>
      <HeaderContent />
    </Suspense>
  );
}
