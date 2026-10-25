"use client";

import Link from "next/link";
import {
  User,
  Settings,
  ShieldCheck,
  Bell,
  HelpCircle,
  Moon,
  Zap,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import Avatar from "./avatar";
import Badge from "./badge";

type UserData = {
  userId?: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string | null;
  isPro?: boolean;
};

type UserDropdownProps = {
  user?: UserData | null;
  onSignOut?: () => void;
};

export default function UserDropdown({ user, onSignOut }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPending, startTransition] = useTransition();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const currentUser = {
    name: user?.fullName || "Bonnie Green",
    email: user?.email || "name@flowbite.com",
    avatarUrl: user?.avatarUrl ?? null,
    isPro: user?.isPro ?? true,
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Logout
  const handleLogout = () => {
    startTransition(async () => {
      try {
        const result = await logoutAction();

        if (result.success) {
          setIsOpen(false);

          if (onSignOut) {
            onSignOut();
          }

          router.push("/login");
          router.refresh();
        }
      } catch (error) {
        console.error("Logout failed:", error);
      }
    });
  };

  // Dark mode UI
  const handleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;

      document.documentElement.classList.toggle("dark", next);

      return next;
    });
  };

  return (
    <div ref={dropdownRef} className="relative z-50">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User menu"
        className="flex items-center gap-2 rounded-full outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Avatar src={currentUser.avatarUrl} size="sm" />

        <ChevronDown
          className={`hidden h-4 w-4 text-muted-foreground transition-transform sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900"
        >
          {/* User Info */}
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60">
            <Avatar src={currentUser.avatarUrl} size="sm" />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {currentUser.name}
              </p>

              <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                {currentUser.email}
              </p>
            </div>

            {currentUser.isPro && (
              <Badge variant="brand" size="sm" className="shrink-0 font-bold">
                PRO
              </Badge>
            )}
          </div>

          <div className="my-2 border-t border-gray-100 dark:border-gray-800" />

          {/* Main Navigation */}
          <div className="space-y-1">
            <DropdownLink
              href="/account"
              icon={<User />}
              label="Account"
              onClick={() => setIsOpen(false)}
            />

            <DropdownLink
              href="/settings"
              icon={<Settings />}
              label="Settings"
              onClick={() => setIsOpen(false)}
            />

            <DropdownLink
              href="/privacy"
              icon={<ShieldCheck />}
              label="Privacy"
              onClick={() => setIsOpen(false)}
            />

            <DropdownLink
              href="/notifications"
              icon={<Bell />}
              label="Notifications"
              onClick={() => setIsOpen(false)}
            />

            <DropdownLink
              href="/help"
              icon={<HelpCircle />}
              label="Help center"
              onClick={() => setIsOpen(false)}
            />

            {/* Dark Mode */}
            <button
              type="button"
              role="menuitem"
              onClick={handleDarkMode}
              className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <span className="flex items-center gap-2.5">
                <Moon className="h-4 w-4 text-gray-500" />
                Dark mode
              </span>

              <span
                className={`relative h-5 w-9 rounded-full transition ${
                  isDarkMode ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${
                    isDarkMode ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          </div>

          <div className="my-2 border-t border-gray-100 dark:border-gray-800" />

          {/* Secondary Navigation */}
          <div className="space-y-1">
            <DropdownLink
              href="/upgrade"
              icon={<Zap className="text-amber-500" />}
              label="Upgrade to PRO"
              onClick={() => setIsOpen(false)}
            />

            {/* Logout */}
            <button
              type="button"
              role="menuitem"
              disabled={isPending}
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" />

              <span>{isPending ? "Signing out..." : "Sign out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Dropdown Link
type DropdownLinkProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
};

function DropdownLink({ href, icon, label, onClick }: DropdownLinkProps) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
    >
      <span className="flex h-4 w-4 items-center justify-center text-gray-500">
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  );
}
