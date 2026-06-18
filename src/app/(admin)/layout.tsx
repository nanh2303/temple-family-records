import { AdminHeader } from "@/components/layout/AdminHeader";

export default function AdminRouteGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-gradient-bg min-h-screen">
      <AdminHeader />
      <div className="mx-auto max-w-5xl px-4 py-8 animate-fade-in">{children}</div>
    </div>
  );
}
