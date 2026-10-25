import RegisterForm from "@/components/auth/RegisterForm";

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
