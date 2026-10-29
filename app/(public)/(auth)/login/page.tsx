import { getServerSession } from "next-auth";
import LoginForm from "./components/login-form";
import { authOptions } from "@/lib/auth/auth";

export default function LoginPage() {
  return (
    <main className="h-[60vh] flex items-center justify-center">
      <LoginForm />
    </main>
  );
}
