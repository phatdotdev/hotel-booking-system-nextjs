"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, UserRound, Briefcase } from "lucide-react";

export default function PartnerSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Tổng quan", href: "/partner", icon: LayoutDashboard },
    { name: "Hồ sơ của tôi", href: "/partner/profile", icon: UserRound },
    { name: "Khách sạn", href: "/partner/hotels", icon: Building2 },
    { name: "Tuyển dụng & Việc làm", href: "/partner/jobs", icon: Briefcase },
  ];

  return (
    <aside className="w-64 border-r bg-background min-h-screen p-4">
      <div className="mb-8 px-4 text-xl font-bold text-primary">
        Partner Portal
      </div>
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/partner" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
