"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";

type HotelForm = {
  name: string;
  description: string;
  phone: string;
  country: string;
  city: string;
  address: string;
};

const emptyForm: HotelForm = {
  name: "",
  description: "",
  phone: "",
  country: "",
  city: "",
  address: "",
};

const inputClass =
  "mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

function EditHotelContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [form, setForm] = useState<HotelForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadHotel() {
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

        if (!response.ok) {
          throw new Error(data.message || "Không thể tải khách sạn.");
        }

        const hotel = data.hotels.find(
          (item: HotelForm & { id: string }) => item.id === id,
        );

        if (!hotel) {
          router.replace("/partner/hotels");
          return;
        }

        setForm({
          name: hotel.name ?? "",
          description: hotel.description ?? "",
          phone: hotel.phone ?? "",
          country: hotel.country ?? "",
          city: hotel.city ?? "",
          address: hotel.address ?? "",
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadHotel();

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/hotels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Không thể cập nhật khách sạn.");
      }

      router.push("/partner/hotels");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin" />
        <span className="ml-3 text-sm text-muted-foreground">
          Đang tải khách sạn...
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/partner/hotels"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          Chỉnh sửa khách sạn
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cập nhật thông tin khách sạn của bạn.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-5 rounded-2xl border bg-background p-5 shadow-sm sm:p-7"
        >
          <div>
            <label className="text-sm font-medium">Tên khách sạn *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={inputClass}
              maxLength={200}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`${inputClass} min-h-28 resize-y`}
              maxLength={5000}
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Số điện thoại</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={inputClass}
              maxLength={20}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Quốc gia *</label>
              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                className={inputClass}
                maxLength={100}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tỉnh / Thành phố *</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className={inputClass}
                maxLength={100}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Địa chỉ chi tiết *</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className={inputClass}
              maxLength={255}
              required
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <div className="flex justify-end border-t pt-5">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function EditHotelPage() {
  return (
    <Suspense>
      <EditHotelContent />
    </Suspense>
  );
}
