import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/data/mongoose";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function DashboardContent() {
  const session = await getServerSession(authOptions);

  if (!session?.userId) {
    redirect("/login");
  }

  await connectDB();

  const user = await User.findById(session.userId)
    .select("-passwordHash")
    .lean();

  if (!user || !user.isActive) {
    redirect("/login");
  }

  return (
    <main className="">
      <h1>Xin chào, {user.fullName}</h1>
      <p>Email: {user.email}</p>
      <p>Vai trò: {user.role}</p>
    </main>
  );
}

export default async function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
