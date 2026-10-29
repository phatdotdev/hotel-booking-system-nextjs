import RegisterForm from "@/app/(public)/(auth)/register/components/register-form";

export const metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <main className="min-h-[calc(100vh-100px)] flex items-center justify-center">
      <RegisterForm />
    </main>
  );
}
