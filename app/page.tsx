import {
    ArrowRight,
    BedDouble,
    CalendarDays,
    CheckCircle2,
    MapPin,
    Search,
    ShieldCheck,
    Star,
    Users,
    Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const featuredHotels = [
    {
        name: "Mekong Riverside Hotel",
        location: "Ninh Kiều, Cần Thơ",
        rating: 4.8,
        reviews: 324,
        price: 850_000,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    },
    {
        name: "The Garden Boutique",
        location: "Quận 1, Hồ Chí Minh",
        rating: 4.7,
        reviews: 218,
        price: 1_200_000,
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80",
    },
    {
        name: "Ocean Pearl Resort",
        location: "Đà Nẵng",
        rating: 4.9,
        reviews: 487,
        price: 1_650_000,
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80",
    },
];

const features = [
    {
        icon: Search,
        title: "Tìm kiếm dễ dàng",
        description:
            "Tìm khách sạn phù hợp với điểm đến, ngày lưu trú và ngân sách của bạn.",
    },
    {
        icon: Wallet,
        title: "Giá tốt mỗi ngày",
        description: "So sánh nhiều lựa chọn để tìm được mức giá phù hợp nhất.",
    },
    {
        icon: ShieldCheck,
        title: "Đặt phòng an toàn",
        description:
            "Thông tin đặt phòng được bảo vệ với quy trình thanh toán an toàn.",
    },
    {
        icon: CheckCircle2,
        title: "Xác nhận nhanh chóng",
        description: "Nhận thông tin xác nhận ngay sau khi hoàn tất đặt phòng.",
    },
];

export default function Home() {
    return (
        <main className="min-h-screen bg-background">
            {/* HERO */}
            <section className="relative overflow-hidden bg-primary">
                {/* Decorative shapes */}
                <div className="absolute -right-32 -top-32 size-96 rounded-full bg-white/5" />
                <div className="absolute -bottom-40 -left-20 size-96 rounded-full bg-white/5" />

                <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                            <Star className="size-4 fill-current text-orange-300" />
                            Hơn 10.000+ khách sạn trên toàn quốc
                        </span>

                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Tìm nơi nghỉ dưỡng
                            <span className="block text-orange-300">
                                hoàn hảo cho bạn
                            </span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
                            Khám phá những khách sạn tuyệt vời, so sánh giá và
                            đặt phòng nhanh chóng cho chuyến đi tiếp theo của
                            bạn.
                        </p>
                    </div>

                    {/* Search box */}
                    <div className="mx-auto mt-10 max-w-5xl rounded-2xl bg-white p-3 shadow-2xl">
                        <div className="grid gap-2 md:grid-cols-[1.5fr_1fr_1fr_auto]">
                            {/* Destination */}
                            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-muted">
                                <MapPin className="size-5 shrink-0 text-primary" />

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Điểm đến
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-foreground">
                                        Bạn muốn đi đâu?
                                    </p>
                                </div>
                            </div>

                            {/* Check in */}
                            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-muted">
                                <CalendarDays className="size-5 shrink-0 text-primary" />

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Nhận phòng
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-foreground">
                                        Chọn ngày
                                    </p>
                                </div>
                            </div>

                            {/* Guests */}
                            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-muted">
                                <Users className="size-5 shrink-0 text-primary" />

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Khách
                                    </p>
                                    <p className="mt-1 text-sm font-medium text-foreground">
                                        2 khách
                                    </p>
                                </div>
                            </div>

                            <Button className="h-auto min-h-12 rounded-xl bg-booking px-6 text-booking-foreground hover:bg-booking/90">
                                <Search className="mr-2 size-4" />
                                Tìm kiếm
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-b border-border bg-card">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <div key={feature.title} className="flex gap-4">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Icon className="size-5" />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-foreground">
                                        {feature.title}
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                            Khách sạn nổi bật
                        </p>

                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Những nơi đáng để bạn nghỉ lại
                        </h2>

                        <p className="mt-3 max-w-2xl text-muted-foreground">
                            Khám phá những khách sạn được yêu thích bởi hàng
                            nghìn du khách.
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        className="w-fit gap-2 text-primary hover:text-primary"
                    >
                        Xem tất cả
                        <ArrowRight className="size-4" />
                    </Button>
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {featuredHotels.map((hotel) => (
                        <article
                            key={hotel.name}
                            className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                        >
                            {/* Image */}
                            <div className="relative aspect-[16/10] overflow-hidden">
                                <img
                                    src={hotel.image}
                                    alt={hotel.name}
                                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                                <div className="absolute left-4 top-4 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-foreground shadow">
                                    Ưu đãi tốt
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="font-semibold text-foreground">
                                            {hotel.name}
                                        </h3>

                                        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <MapPin className="size-3.5" />
                                            {hotel.location}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-sm font-semibold text-orange-600">
                                        <Star className="size-3.5 fill-current" />
                                        {hotel.rating}
                                    </div>
                                </div>

                                <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Từ
                                        </p>

                                        <p className="mt-0.5 text-lg font-bold text-primary">
                                            {hotel.price.toLocaleString(
                                                "vi-VN",
                                            )}
                                            đ
                                            <span className="text-xs font-normal text-muted-foreground">
                                                {" "}
                                                / đêm
                                            </span>
                                        </p>
                                    </div>

                                    <Button
                                        size="sm"
                                        className="bg-booking text-booking-foreground hover:bg-booking/90"
                                    >
                                        Đặt phòng
                                    </Button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center sm:px-12">
                    <div className="absolute -right-20 -top-20 size-64 rounded-full bg-white/5" />
                    <div className="absolute -bottom-32 -left-20 size-80 rounded-full bg-white/5" />

                    <div className="relative mx-auto max-w-2xl">
                        <BedDouble className="mx-auto size-10 text-orange-300" />

                        <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
                            Sẵn sàng cho chuyến đi tiếp theo?
                        </h2>

                        <p className="mt-4 text-blue-100">
                            Tìm một nơi tuyệt vời để nghỉ ngơi và bắt đầu hành
                            trình của bạn ngay hôm nay.
                        </p>

                        <Button className="mt-8 bg-booking px-6 text-booking-foreground hover:bg-booking/90">
                            Khám phá khách sạn
                            <ArrowRight className="ml-2 size-4" />
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    );
}
