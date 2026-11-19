"use client";

import { PartnerService } from "@/services/partner.service";
import { PartnerProfile } from "@/types/partner";
import { Hotel, HotelStatus } from "@/types/hotel";

import {
  Building2,
  LoaderCircle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import HotelCard from "./components/hotel-card";

export default function PartnerPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<PartnerProfile | null>(null);

  const [hotels, setHotels] = useState<Hotel[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<HotelStatus | "ALL">("ALL");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [profileResponse, hotelsResponse] = await Promise.all([
        PartnerService.getProfile(),
        PartnerService.getHotels({
          page: 1,
          limit: 100,
        }),
      ]);

      console.log(profileResponse);
      console.log(hotelsResponse);

      // if (profileResponse.onboardingStatus !== "COMPLETED") {
      //   router.replace("/partner/onboarding");
      //   return;
      // }

      setProfile(profileResponse);
      setHotels(hotelsResponse?.data || []);
    } catch (err) {
      console.error(err);

      setError("Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void Promise.resolve().then(fetchDashboard);
  }, [fetchDashboard]);

  const statistics = useMemo(() => {
    return {
      total: hotels.length,

      active: hotels.filter((hotel) => hotel.status === "ACTIVE").length,

      pending: hotels.filter((hotel) => hotel.status === "PENDING").length,

      draft: hotels.filter((hotel) => hotel.status === "DRAFT").length,
    };
  }, [hotels]);

  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      const matchesSearch = hotel.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || hotel.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [hotels, search, statusFilter]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />

        <p className="text-muted-foreground">{error}</p>

        <button
          onClick={fetchDashboard}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground"
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Xin chào, {profile?.representativeName || "Đối tác"} 👋
          </h1>

          <p className="mt-2 text-muted-foreground">
            Quản lý khách sạn và hoạt động kinh doanh của bạn.
          </p>
        </div>

        <button
          onClick={() => router.push("/partner/hotels/new")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-5 w-5" />
          Đăng ký khách sạn
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total */}
        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Tổng khách sạn</div>

            <Building2 className="h-5 w-5 text-primary" />
          </div>

          <div className="mt-3 text-3xl font-bold">{statistics.total}</div>

          <p className="mt-1 text-xs text-muted-foreground">
            Khách sạn bạn đang quản lý
          </p>
        </div>

        {/* Active */}
        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Đang hoạt động</div>

            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>

          <div className="mt-3 text-3xl font-bold">{statistics.active}</div>

          <p className="mt-1 text-xs text-muted-foreground">
            Khách sạn đã được duyệt
          </p>
        </div>

        {/* Pending */}
        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Chờ duyệt</div>

            <Clock className="h-5 w-5 text-yellow-600" />
          </div>

          <div className="mt-3 text-3xl font-bold">{statistics.pending}</div>

          <p className="mt-1 text-xs text-muted-foreground">
            Đang chờ xác nhận
          </p>
        </div>

        {/* Draft */}
        <div className="rounded-xl border bg-background p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Bản nháp</div>

            <AlertCircle className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="mt-3 text-3xl font-bold">{statistics.draft}</div>

          <p className="mt-1 text-xs text-muted-foreground">
            Chưa hoàn tất đăng ký
          </p>
        </div>
      </div>

      {/* Hotel List */}
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold">Khách sạn của bạn</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Danh sách khách sạn bạn đang sở hữu.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm khách sạn..."
              className="h-10 w-full rounded-lg border bg-background pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: "ALL", label: "Tất cả" },
            { value: "ACTIVE", label: "Đang hoạt động" },
            { value: "PENDING", label: "Chờ duyệt" },
            { value: "DRAFT", label: "Bản nháp" },
            { value: "REJECTED", label: "Bị từ chối" },
            { value: "SUSPENDED", label: "Tạm ngưng" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setStatusFilter(item.value as HotelStatus | "ALL")}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                statusFilter === item.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Hotels */}
        {filteredHotels.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredHotels.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 text-center">
            <Building2 className="h-14 w-14 text-muted-foreground/40" />

            <h3 className="mt-4 text-lg font-semibold">
              {hotels.length === 0
                ? "Bạn chưa có khách sạn nào"
                : "Không tìm thấy khách sạn"}
            </h3>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {hotels.length === 0
                ? "Hãy bắt đầu đăng ký khách sạn đầu tiên của bạn để quản lý hoạt động kinh doanh."
                : "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc."}
            </p>

            {hotels.length === 0 && (
              <button
                onClick={() => router.push("/partner/hotels/new")}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Đăng ký khách sạn
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
