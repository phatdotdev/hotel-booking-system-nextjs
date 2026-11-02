"use client";

import { PartnerService } from "@/services/partner.service";
import { PartnerProfile } from "@/types/partner";
import { Building2, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function PartnerPage() {
  const router = useRouter();
  const [checkingPartner, setCheckPartner] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PartnerProfile | null>(null);

  useEffect(() => {
    async function checkPartner() {
      try {
        const response = await PartnerService.getProfile();
        if (response.onboardingStatus === "COMPLETED") {
          router.push("/partner/onboarding");
        }
      } catch (err) {
        setCheckPartner(false);
      }
    }
    checkPartner();
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <LoaderCircle className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Xin chào, {profile?.representativeName || "Đối tác"} 👋
        </h1>
        <p className="text-muted-foreground mt-2">
          Chào mừng bạn đến với bảng điều khiển quản lý kinh doanh.
        </p>
      </div>

      {/* Grid thống kê (Ví dụ) */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-6 bg-background border rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-muted-foreground">
              Khách sạn của bạn
            </h3>
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <p className="mt-4 text-3xl font-bold">0</p>
          <button
            onClick={() => router.push("/partner/hotels/new")}
            className="mt-4 text-sm text-primary hover:underline"
          >
            + Đăng ký khách sạn mới
          </button>
        </div>

        {/* Thêm các thẻ thống kê khác như: Số đơn đặt phòng, Nhân viên... */}
      </div>
    </div>
  );
}
