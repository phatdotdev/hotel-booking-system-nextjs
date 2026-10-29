"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";

type PartnerForm = {
  partnerType: "INDIVIDUAL" | "BUSINESS";
  businessName: string;
  representativeName: string;
  phone: string;
  country: string;
  city: string;
  address: string;
};

const initialForm: PartnerForm = {
  partnerType: "INDIVIDUAL",
  businessName: "",
  representativeName: "",
  phone: "",
  country: "Vietnam",
  city: "",
  address: "",
};

const inputClass =
  "mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

export default function PartnerProfilePage() {
  const router = useRouter();

  const [form, setForm] = useState<PartnerForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPartner() {
      try {
        const response = await fetch("/api/partners", {
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
          throw new Error(data.message || "Không thể tải hồ sơ đối tác.");
        }

        setForm({
          partnerType: data.partner.partnerType,
          businessName: data.partner.businessName ?? "",
          representativeName: data.partner.representativeName ?? "",
          phone: data.partner.phone ?? "",
          country: data.partner.country ?? "",
          city: data.partner.city ?? "",
          address: data.partner.address ?? "",
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải hồ sơ.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPartner();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/partner", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể cập nhật hồ sơ.");
      }

      setMessage("Cập nhật hồ sơ đối tác thành công.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi. Vui lòng thử lại.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin" />
        <span className="ml-3 text-sm text-muted-foreground">
          Đang tải hồ sơ...
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>

        <div className="mb-7">
          <p className="text-sm font-medium text-primary">QUẢN LÝ ĐỐI TÁC</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Hồ sơ đối tác
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Xem và cập nhật thông tin liên hệ, thông tin đại diện và địa chỉ của
            bạn.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border bg-background shadow-sm"
        >
          <div className="space-y-5 p-5 sm:p-7">
            <div>
              <label className="text-sm font-medium">Loại đối tác *</label>

              <select
                name="partnerType"
                value={form.partnerType}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="INDIVIDUAL">Cá nhân</option>
                <option value="BUSINESS">Doanh nghiệp</option>
              </select>
            </div>

            {form.partnerType === "BUSINESS" && (
              <div>
                <label className="text-sm font-medium">
                  Tên doanh nghiệp *
                </label>

                <input
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  className={inputClass}
                  maxLength={200}
                  required
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">
                Họ tên người đại diện *
              </label>

              <input
                name="representativeName"
                value={form.representativeName}
                onChange={handleChange}
                className={inputClass}
                maxLength={100}
                autoComplete="name"
                required
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Số điện thoại *</label>

                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass}
                  maxLength={20}
                  autoComplete="tel"
                  required
                />
              </div>

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
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">
                  Tỉnh / Thành phố *
                </label>

                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className={inputClass}
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Địa chỉ liên hệ *</label>

                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className={inputClass}
                  maxLength={255}
                  autoComplete="street-address"
                  required
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="rounded-lg border border-green-600/20 bg-green-600/5 p-3 text-sm text-green-700"
              >
                {message}
              </p>
            )}
          </div>

          <div className="flex justify-end border-t bg-muted/20 p-5 sm:px-7">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
