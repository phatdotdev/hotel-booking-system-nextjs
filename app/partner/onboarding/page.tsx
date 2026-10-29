"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { FormEvent, useState } from "react";
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  LoaderCircle,
  UserRound,
} from "lucide-react";

type PartnerType = "INDIVIDUAL" | "BUSINESS";

export default function PartnerOnboardingPage() {
  const router = useRouter();

  const [checkingPartner, setCheckingPartner] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkPartner() {
      try {
        const response = await fetch("/api/partners", {
          method: "GET",
          cache: "no-store",
        });

        if (cancelled) return;

        if (response.ok) {
          router.replace("/partner/profile");
          return;
        }

        if (response.status === 404) {
          // Chưa có hồ sơ: cho phép đăng ký mới.
          setCheckingPartner(false);
          return;
        }

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        setError("Không thể kiểm tra hồ sơ đối tác. Vui lòng thử lại.");
        setCheckingPartner(false);
      } catch {
        if (!cancelled) {
          setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
          setCheckingPartner(false);
        }
      }
    }

    checkPartner();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const [partnerType, setPartnerType] = useState<PartnerType>("INDIVIDUAL");

  const [form, setForm] = useState({
    businessName: "",
    representativeName: "",
    phone: "",
    country: "Vietnam",
    city: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/partners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          partnerType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể tạo hồ sơ đối tác.");
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

  if (success) {
    return (
      <main className="min-h-screen bg-muted/30 px-4 py-12">
        <section className="mx-auto max-w-xl rounded-2xl border bg-background p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />

          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            Đã tạo hồ sơ đối tác!
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Thông tin của bạn đã được lưu. Tiếp theo, bạn cần đăng ký khách sạn
            đầu tiên để hoàn tất quá trình thiết lập tài khoản đối tác.
          </p>

          <div className="mt-6 rounded-xl border bg-muted/30 p-4 text-left">
            <p className="text-sm font-medium">Trạng thái hồ sơ</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Đang chờ xem xét
            </p>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            Bước tạo khách sạn sẽ được kết nối ở phần tiếp theo.
          </p>
        </section>
      </main>
    );
  }

  if (checkingPartner) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Đang kiểm tra hồ sơ đối tác...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">
            HOTEL GO · PARTNER PROGRAM
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Trở thành đối tác của chúng tôi
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Cung cấp thông tin cơ bản để bắt đầu quản lý khách sạn và kinh doanh
            trên hệ thống.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            1
          </div>

          <div className="h-1 flex-1 rounded-full bg-border">
            <div className="h-full w-1/3 rounded-full bg-primary" />
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background text-sm text-muted-foreground">
            2
          </div>

          <div className="h-1 flex-1 rounded-full bg-border" />

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background text-sm text-muted-foreground">
            3
          </div>
        </div>

        <div className="mb-5 flex justify-between text-xs text-muted-foreground sm:text-sm">
          <span className="font-medium text-foreground">Hồ sơ đối tác</span>
          <span>Khách sạn</span>
          <span>Hoàn tất</span>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border bg-background shadow-sm"
        >
          <div className="border-b p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">Thông tin đối tác</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Các trường có dấu * là bắt buộc.
                </p>
              </div>
            </div>

            {/* Partner type */}
            <div className="mt-7">
              <label className="text-sm font-medium">
                Bạn đăng ký với tư cách nào? *
              </label>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPartnerType("INDIVIDUAL")}
                  className={`rounded-xl border p-4 text-left transition ${
                    partnerType === "INDIVIDUAL"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <UserRound className="h-5 w-5" />

                  <p className="mt-3 text-sm font-semibold">Cá nhân</p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Kinh doanh khách sạn với tư cách cá nhân.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPartnerType("BUSINESS")}
                  className={`rounded-xl border p-4 text-left transition ${
                    partnerType === "BUSINESS"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <Building2 className="h-5 w-5" />

                  <p className="mt-3 text-sm font-semibold">Doanh nghiệp</p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Đại diện công ty hoặc tổ chức kinh doanh.
                  </p>
                </button>
              </div>
            </div>

            {/* Business name */}
            {partnerType === "BUSINESS" && (
              <div className="mt-5">
                <label htmlFor="businessName" className="text-sm font-medium">
                  Tên doanh nghiệp *
                </label>

                <input
                  id="businessName"
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Nhập tên doanh nghiệp"
                  maxLength={200}
                  required
                />
              </div>
            )}

            {/* Representative */}
            <div className="mt-5">
              <label
                htmlFor="representativeName"
                className="text-sm font-medium"
              >
                Họ và tên người đại diện *
              </label>

              <input
                id="representativeName"
                name="representativeName"
                value={form.representativeName}
                onChange={handleChange}
                className={inputClass}
                placeholder="Nhập họ và tên"
                maxLength={100}
                autoComplete="name"
                required
              />
            </div>

            {/* Contact */}
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="text-sm font-medium">
                  Số điện thoại *
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="0901234567"
                  maxLength={20}
                  autoComplete="tel"
                  required
                />
              </div>

              <div>
                <label htmlFor="country" className="text-sm font-medium">
                  Quốc gia *
                </label>

                <select
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="Vietnam">Việt Nam</option>
                  <option value="Other">Quốc gia khác</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="city" className="text-sm font-medium">
                  Tỉnh / Thành phố *
                </label>

                <input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Ví dụ: Cần Thơ"
                  maxLength={100}
                  autoComplete="address-level2"
                  required
                />
              </div>

              <div>
                <label htmlFor="address" className="text-sm font-medium">
                  Địa chỉ liên hệ *
                </label>

                <input
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Số nhà, đường..."
                  maxLength={255}
                  autoComplete="street-address"
                  required
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p className="text-xs leading-5 text-muted-foreground">
              Thông tin được sử dụng để thiết lập hồ sơ đối tác.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Tiếp tục
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
