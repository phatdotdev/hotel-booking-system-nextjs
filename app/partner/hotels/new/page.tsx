"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";

const inputClass =
  "mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

export default function NewHotelPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    country: "Vietnam",
    city: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Không thể tạo khách sạn.");
      }

      router.push("/partner/hotels");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/partner/hotels"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách khách sạn
        </Link>

        <div className="mb-7 mt-6">
          <p className="text-sm font-medium text-primary">KÊNH ĐỐI TÁC</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Đăng ký khách sạn
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Nhập thông tin cơ bản của khách sạn bạn muốn quản lý.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border bg-background shadow-sm"
        >
          <div className="space-y-5 p-5 sm:p-7">
            <div>
              <label className="text-sm font-medium">Tên khách sạn *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={inputClass}
                placeholder="Ví dụ: Mekong Riverside Hotel"
                maxLength={200}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Mô tả khách sạn</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className={`${inputClass} min-h-28 resize-y`}
                placeholder="Giới thiệu về khách sạn, tiện ích và dịch vụ..."
                maxLength={5000}
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Số điện thoại liên hệ
              </label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
                placeholder="0901234567"
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
                <label className="text-sm font-medium">
                  Tỉnh / Thành phố *
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Ví dụ: Cần Thơ"
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
                placeholder="Số nhà, tên đường..."
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
          </div>

          <div className="flex justify-end border-t bg-muted/20 p-5 sm:px-7">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {loading ? "Đang lưu..." : "Đăng ký khách sạn"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
