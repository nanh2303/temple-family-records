import { AdminHeader } from "@/components/layout/AdminHeader";

export default function AdminRouteGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminHeader />
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
