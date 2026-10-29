import { getServerSession } from "next-auth";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { ReactNode, Suspense } from "react";

async function DynamicLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (session && session.user) {
    redirect("/");
  }
  return <>{children}</>;
}

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense>
      <DynamicLayout>{children}</DynamicLayout>
    </Suspense>
  );
}
