"use client";

import LoadingOverlay from "@/components/common/loading-over-lay";
import { Suspense } from "react";
import { useEffect, useState, useTransition } from "react";
import { getUserAccountAction, updateUserAccount } from "@/actions/user";
import { redirect } from "next/navigation";

import {
  User2,
  CalendarDays,
  Camera,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

interface UserData {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  gender: string;
  country: string;
  city: string;
  address: string;
  role: string;
  status: string;
  createdAt: string;
}
function AccountContent() {
  const [isPending, startTransition] = useTransition();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserAccount() {
      setLoading(true);
      const res = await getUserAccountAction();

      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setError(res.message || "Failed to load account.");
        redirect("/login");
      }
      setLoading(false);
    }

    fetchUserAccount();
  }, []);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await updateUserAccount(formData);

        if (!result.success) {
          alert(result.message);
          return;
        }

        // Update React state with the latest user data
        if (result.user) {
          setUser((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              ...result.user,
            };
          });
        }

        alert(result.message);
      } catch (error) {
        console.error("Update account error:", error);

        alert("An unexpected error occurred while updating your account.");
      }
    });
  };

  if (isPending || !user) {
    return <LoadingOverlay />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
        <form action={handleSubmit} className="space-y-4">
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Dashboard</span>
                <span>/</span>
                <span>Account</span>
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight">
                Account Information
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage your personal information and account settings.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>

          {/* Profile Overview */}
          <section className="rounded-xl border bg-background p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="h-12 w-12" />
                </div>

                <button
                  type="button"
                  aria-label="Change avatar"
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm transition hover:bg-muted"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold">{user.fullName}</h2>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {user.status}
                  </span>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                  {user.email}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    {user.role}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    Member since {user.createdAt}
                  </span>
                </div>
              </div>

              {/* Edit Profile */}
              <button
                type="button"
                className="inline-flex items-center gap-2 self-start rounded-lg border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted sm:self-center"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </section>

          {/* Personal Information */}
          <section className="rounded-xl border bg-background">
            <div className="border-b p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User2 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold">Personal Information</h2>

                  <p className="text-sm text-muted-foreground">
                    Update your personal details.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </label>

                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    id="fullName"
                    name="fullName"
                    defaultValue={user.fullName}
                    className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    defaultValue={user.email}
                    className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={user.phone}
                    className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label htmlFor="dateOfBirth" className="text-sm font-medium">
                  Date of Birth
                </label>

                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    defaultValue={user.dateOfBirth || ""}
                    className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium">
                  Gender
                </label>

                <select
                  id="gender"
                  name="gender"
                  defaultValue={user.gender}
                  className="h-11 w-full rounded-lg border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="">Prefer not to say</option>
                </select>
              </div>
            </div>
          </section>

          {/* Address Information */}
          <section className="rounded-xl border bg-background">
            <div className="border-b p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold">Address Information</h2>

                  <p className="text-sm text-muted-foreground">
                    Manage your contact address.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-2">
              {/* Country */}
              <div className="space-y-2">
                <label htmlFor="country" className="text-sm font-medium">
                  Country
                </label>

                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    id="country"
                    name="country"
                    defaultValue={user.country}
                    className="h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium">
                  City
                </label>

                <input
                  id="city"
                  name="city"
                  defaultValue={user.city}
                  className="h-11 w-full rounded-lg border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="address" className="text-sm font-medium">
                  Address
                </label>

                <input
                  id="address"
                  name="address"
                  defaultValue={user.address}
                  className="h-11 w-full rounded-lg border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </section>

          {/* Account Information */}
          <section className="rounded-xl border bg-background">
            <div className="border-b p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-semibold">Account Information</h2>

                  <p className="text-sm text-muted-foreground">
                    Your account details and permissions.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Account Role</p>

                <p className="mt-1 text-sm font-medium">{user.role}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Account Status</p>

                <p className="mt-1 text-sm font-medium text-green-600">
                  {user.status}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>

                <p className="mt-1 text-sm font-medium">{user.createdAt}</p>
              </div>
            </div>
          </section>

          {/* Bottom Actions */}
          <div className="flex justify-end gap-3 pb-6">
            <button
              type="button"
              className="rounded-lg border bg-background px-5 py-2.5 text-sm font-medium transition hover:bg-muted"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <AccountContent />
    </Suspense>
  );
}
