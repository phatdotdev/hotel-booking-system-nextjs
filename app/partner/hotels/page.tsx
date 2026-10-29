"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Plus, Pencil, LoaderCircle } from "lucide-react";

type Hotel = {
  id: string;
  name: string;
  description: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  status: "DRAFT" | "PENDING" | "ACTIVE" | "REJECTED";
};

const statusLabels: Record<Hotel["status"], string> = {
  DRAFT: "Bản nháp",
  PENDING: "Chờ duyệt",
  ACTIVE: "Đã duyệt",
  REJECTED: "Bị từ chối",
};

export default function PartnerHotelsPage() {
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHotels() {
      try {
        const response = await fetch("/api/hotels", {
          cache: "no-store",
        });
        const data = await response.json();

        if (cancelled) return;

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (response.status === 404) {
          router.replace("/partner/onboarding");
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Không thể tải khách sạn.");
        }

        setHotels(data.hotels);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHotels();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">KÊNH ĐỐI TÁC</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Quản lý khách sạn
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Theo dõi và cập nhật thông tin các khách sạn của bạn.
            </p>
          </div>

          <Link
            href="/partner/hotels/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Đăng ký khách sạn
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border bg-background p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">Khách sạn của tôi</h2>
              <p className="text-sm text-muted-foreground">
                {hotels.length} khách sạn
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <LoaderCircle className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <p role="alert" className="mt-6 text-sm text-destructive">
              {error}
            </p>
          ) : hotels.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed px-5 py-12 text-center">
              <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">
                Bạn chưa đăng ký khách sạn nào
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Tạo hồ sơ khách sạn đầu tiên để bắt đầu quản lý.
              </p>
              <Link
                href="/partner/hotels/new"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
                Tạo khách sạn đầu tiên
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {hotels.map((hotel) => (
                <article
                  key={hotel.id}
                  className="rounded-xl border p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{hotel.name}</h3>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                          {statusLabels[hotel.status]}
                        </span>
                      </div>

                      <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                        {hotel.address}, {hotel.city}, {hotel.country}
                      </p>

                      {hotel.phone && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Điện thoại: {hotel.phone}
                        </p>
                      )}

                      {hotel.description && (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                          {hotel.description}
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/partner/hotels/${hotel.id}/edit`}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
                    >
                      <Pencil className="h-4 w-4" />
                      Chỉnh sửa
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
