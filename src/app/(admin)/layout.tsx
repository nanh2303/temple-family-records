import { AdminHeader } from "@/components/layout/AdminHeader";

export default function AdminRouteGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-gradient-bg min-h-screen">
      <AdminHeader />
      <div className="mx-auto max-w-6xl px-4 py-6 animate-fade-in sm:px-6 sm:py-8">{children}</div>
    </div>
  );
}
