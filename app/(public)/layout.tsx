import { Suspense } from "react";

import type { Metadata } from "next";
import Header from "./components/header";

export const metadata: Metadata = {
  title: "Hotel Booking System",
  description: "Hotel Booking System Home Page",
};

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="relative min-h-full flex flex-col">
      <Header />
      {children}
    </main>
  );
}
