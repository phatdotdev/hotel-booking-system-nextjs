import { Badge } from "@/components/ui/badge";
import { HotelStatus } from "@/types/hotel";

const statusConfig: Record<
  HotelStatus,
  {
    label: string;
    className: string;
  }
> = {
  DRAFT: {
    label: "Bản nháp",
    className: "bg-gray-100 text-gray-700",
  },
  PENDING: {
    label: "Chờ duyệt",
    className: "bg-yellow-100 text-yellow-700",
  },
  ACTIVE: {
    label: "Đang hoạt động",
    className: "bg-green-100 text-green-700",
  },
  REJECTED: {
    label: "Bị từ chối",
    className: "bg-red-100 text-red-700",
  },
  SUSPENDED: {
    label: "Tạm ngưng",
    className: "bg-orange-100 text-orange-700",
  },
};

interface HotelStatusBadgeProps {
  status: HotelStatus;
}

export default function HotelStatusBadge({ status }: HotelStatusBadgeProps) {
  const config = statusConfig[status] || "ACTIVE";

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
}
