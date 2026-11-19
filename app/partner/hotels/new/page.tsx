"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import {
  ArrowLeft,
  LoaderCircle,
  Save,
  MapPin,
  Image as ImageIcon,
} from "lucide-react";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/form/map-picker"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] w-full rounded-xl border bg-muted flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Đang tải bản đồ...</p>
    </div>
  ),
});

// Tùy chỉnh CSS class dùng chung cho input
const inputClass =
  "mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";
const labelClass = "text-sm font-medium";

// Định nghĩa Type cho Form
type HotelFormValues = {
  name: string;
  propertyType: "HOTEL" | "RESORT" | "VILLA" | "HOMESTAY" | "APARTMENT";
  starRating: number;
  description: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  address: string;
  // Tọa độ Latitude / Longitude (để lấy từ bản đồ)
  latitude: number;
  longitude: number;
  // Mảng tiện ích
  amenities: string[];
  checkInTime: string;
  checkOutTime: string;
  // URLs ảnh (Sẽ được điền sau khi upload qua Cloud)
  thumbnail: string;
  gallery: string[];
};

export default function NewHotelPage() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khởi tạo React Hook Form
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HotelFormValues>({
    defaultValues: {
      name: "",
      propertyType: "HOTEL",
      starRating: 3,
      description: "",
      phone: "",
      email: "",
      country: "Vietnam",
      city: "",
      address: "",
      latitude: 10.0452, // Mặc định ở Cần Thơ (để hiển thị bản đồ mẫu)
      longitude: 105.7469,
      amenities: [],
      checkInTime: "14:00",
      checkOutTime: "12:00",
      thumbnail: "",
      gallery: [],
    },
  });

  const amenitiesOptions = [
    "WIFI",
    "POOL",
    "GYM",
    "SPA",
    "PARKING",
    "RESTAURANT",
    "BAR",
  ];

  // Xử lý Submit
  const onSubmit = async (data: HotelFormValues) => {
    setIsSubmitting(true);
    setGlobalError("");

    try {
      // Chuyển đổi dữ liệu Form thành định dạng chuẩn của MongoDB GeoJSON
      const payload = {
        ...data,
        location: {
          type: "Point",
          // Nhớ kỹ: MongoDB lưu tọa độ theo [Longitude, Latitude]
          coordinates: [data.longitude, data.latitude],
        },
      };

      const response = await fetch("/api/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message || "Không thể tạo khách sạn.");
      }

      router.push("/partner/hotels");
      router.refresh();
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/partner/hotels"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </Link>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Đăng ký khách sạn
          </h1>
          <p className="mt-2 text-sm text-muted-foreground mb-8">
            Vui lòng điền đầy đủ thông tin để thu hút khách hàng tốt nhất.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-hidden rounded-2xl border bg-background shadow-sm space-y-8"
        >
          {/* PHẦN 1: THÔNG TIN CƠ BẢN */}
          <div className="p-5 sm:p-7 border-b">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              1. Thông tin cơ bản
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Tên chỗ nghỉ *</label>
                <input
                  {...register("name", {
                    required: "Vui lòng nhập tên chỗ nghỉ",
                  })}
                  className={inputClass}
                  placeholder="Ví dụ: Mekong Riverside Hotel"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Loại hình</label>
                <select {...register("propertyType")} className={inputClass}>
                  <option value="HOTEL">Khách sạn</option>
                  <option value="RESORT">Khu nghỉ dưỡng (Resort)</option>
                  <option value="HOMESTAY">Homestay</option>
                  <option value="VILLA">Biệt thự (Villa)</option>
                  <option value="APARTMENT">Căn hộ</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Hạng sao</label>
                <select
                  {...register("starRating", { valueAsNumber: true })}
                  className={inputClass}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <option key={star} value={star}>
                      {star} Sao
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Mô tả chỗ nghỉ</label>
                <textarea
                  {...register("description")}
                  className={`${inputClass} min-h-[120px]`}
                  placeholder="Mô tả các điểm nổi bật, dịch vụ..."
                />
              </div>

              <div>
                <label className={labelClass}>Giờ nhận phòng (Check-in)</label>
                <input
                  type="time"
                  {...register("checkInTime")}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Giờ trả phòng (Check-out)</label>
                <input
                  type="time"
                  {...register("checkOutTime")}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* PHẦN 2: LIÊN HỆ & ĐỊA CHỈ */}
          <div className="p-5 sm:p-7 border-b">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> 2. Liên hệ & Vị trí
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Số điện thoại</label>
                <input
                  {...register("phone")}
                  className={inputClass}
                  placeholder="0901234567"
                />
              </div>
              <div>
                <label className={labelClass}>Email (Tuỳ chọn)</label>
                <input
                  type="email"
                  {...register("email")}
                  className={inputClass}
                  placeholder="hotel@example.com"
                />
              </div>

              <div>
                <label className={labelClass}>Tỉnh / Thành phố *</label>
                <input
                  {...register("city", { required: true })}
                  className={inputClass}
                  placeholder="Cần Thơ"
                />
              </div>
              <div>
                <label className={labelClass}>Quốc gia *</label>
                <input
                  {...register("country", { required: true })}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>Địa chỉ chi tiết *</label>
                <input
                  {...register("address", {
                    required: "Vui lòng nhập địa chỉ",
                  })}
                  className={inputClass}
                />
              </div>

              {/* Tích hợp Bản Đồ (Placeholder) */}
              <div className="sm:col-span-2">
                <MapPicker
                  label="Vị trí khách sạn"
                  placeholder="Chọn vị trí khách sạn trên bản đồ"
                  value={{ lat: watch("latitude"), lng: watch("longitude") }}
                  onChange={(pos) => {
                    setValue("latitude", pos.lat);
                    setValue("longitude", pos.lng);
                  }}
                  height={350}
                />
                <div className="flex gap-4 mt-3 w-full max-w-sm">
                  <input
                    type="number"
                    step="any"
                    {...register("latitude")}
                    className={inputClass}
                    readOnly
                    placeholder="Vĩ độ (Lat)"
                  />
                  <input
                    type="number"
                    step="any"
                    {...register("longitude")}
                    className={inputClass}
                    readOnly
                    placeholder="Kinh độ (Lng)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PHẦN 3: TIỆN ÍCH & HÌNH ẢNH */}
          <div className="p-5 sm:p-7">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" /> 3. Tiện ích & Hình
              ảnh
            </h2>

            <div className="mb-6">
              <label className={labelClass}>Tiện ích nổi bật</label>
              <div className="mt-3 flex flex-wrap gap-3">
                {amenitiesOptions.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 border rounded-full px-4 py-2 cursor-pointer hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      value={amenity}
                      {...register("amenities")}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm font-medium">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-muted/50 p-6 border border-dashed flex flex-col items-center justify-center text-center">
              <ImageIcon className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">
                Tích hợp Upload Ảnh (Uploadthing/Cloudinary) tại đây
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sau khi upload xong, lưu URL trả về bằng lệnh:
                <br />
                <code>{'setValue("thumbnail", "url-anh")'}</code>
              </p>
            </div>

            {globalError && (
              <p className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {globalError}
              </p>
            )}
          </div>

          <div className="flex justify-end border-t bg-muted/20 p-5 sm:px-7 rounded-b-2xl">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? "Đang xử lý..." : "Lưu & Đăng ký"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
