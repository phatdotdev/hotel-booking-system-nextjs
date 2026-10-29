"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  DoorOpen,
  BedDouble,
  Users,
  UserRoundCog,
  Tags,
  ChartNoAxesCombined,
  Wallet,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  Hotel,
  type LucideIcon,
} from "lucide-react";

type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type MenuGroup = {
  label: string;
  items: MenuItem[];
};

const menuGroups: MenuGroup[] = [
  {
    label: "Tổng quan",
    items: [
      {
        label: "Dashboard",
        href: "/manager/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Quản lý kinh doanh",
    items: [
      {
        label: "Khách sạn của tôi",
        href: "/manager/hotels",
        icon: Building2,
      },
      {
        label: "Đặt phòng",
        href: "/manager/bookings",
        icon: CalendarCheck,
      },
      {
        label: "Phòng",
        href: "/manager/rooms",
        icon: DoorOpen,
      },
      {
        label: "Loại phòng",
        href: "/manager/room-types",
        icon: BedDouble,
      },
      {
        label: "Khách hàng",
        href: "/manager/customers",
        icon: Users,
      },
      {
        label: "Nhân viên",
        href: "/manager/staff",
        icon: UserRoundCog,
      },
      {
        label: "Giá phòng & khuyến mãi",
        href: "/manager/pricing",
        icon: Tags,
      },
    ],
  },
  {
    label: "Tài chính & báo cáo",
    items: [
      {
        label: "Thanh toán",
        href: "/manager/payments",
        icon: Wallet,
      },
      {
        label: "Doanh thu & thống kê",
        href: "/manager/reports",
        icon: ChartNoAxesCombined,
      },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      {
        label: "Cài đặt",
        href: "/manager/settings",
        icon: Settings,
      },
    ],
  },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHotelMenuOpen, setIsHotelMenuOpen] = useState(true);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r
        border-gray-200 bg-white transition-all duration-300
        ${isCollapsed ? "w-16" : "w-64"}`}
    >
      {/* Header */}
      <div
        className={`flex h-16 shrink-0 items-center border-b border-gray-200
          ${isCollapsed ? "justify-center px-2" : "justify-between px-4"}`}
      >
        {!isCollapsed && (
          <Link
            href="/manager/dashboard"
            className="flex min-w-0 items-center gap-2"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black font-bold text-xl text-white">
              H
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900">
                Hotel Manager
              </p>
              <p className="truncate text-xs text-gray-500">
                Quản lý khách sạn
              </p>
            </div>
          </Link>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Điều hướng quản lý khách sạn"
        className="flex-1 space-y-5 overflow-y-auto px-3 py-5"
      >
        {menuGroups.map((group) => (
          <section key={group.label}>
            {!isCollapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {group.label}
              </p>
            )}

            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors
                        ${isCollapsed ? "justify-center px-2" : ""}
                        ${
                          active
                            ? "bg-blue-50 font-semibold text-blue-700"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                    >
                      <Icon
                        className={`h-5 w-5 shrink-0 ${
                          active
                            ? "text-blue-700"
                            : "text-gray-500 group-hover:text-gray-900"
                        }`}
                      />

                      {!isCollapsed && (
                        <span className="min-w-0 flex-1">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-gray-200 p-3">
        {!isCollapsed ? (
          <div className="px-2 py-1">
            <p className="text-xs font-medium text-gray-600">
              Hotel Management System
            </p>
            <p className="mt-1 text-xs text-gray-400">Phiên bản 1.0</p>
          </div>
        ) : (
          <div
            className="flex justify-center py-1"
            title="Hotel Management System"
          >
            <Hotel className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
    </aside>
  );
}
