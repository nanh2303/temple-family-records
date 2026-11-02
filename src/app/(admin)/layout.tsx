import { AdminHeader } from "@/components/layout/AdminHeader";

export default function AdminRouteGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-gradient-bg min-h-screen">
      <AdminHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-7 animate-fade-in sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
