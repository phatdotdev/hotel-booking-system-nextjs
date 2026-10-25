"use client";

import LoadingOverlay from "@/components/common/loading-over-lay";
import AccountContent from "@/components/user/account-content";
import { Suspense } from "react";

export default function AccountPage() {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <AccountContent />
    </Suspense>
  );
}
