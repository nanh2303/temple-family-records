import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold text-zinc-900">Page not found</h1>
      <p className="max-w-md text-sm text-zinc-600">The requested resource does not exist or you may not have access.</p>
      <Button asChild variant="outline">
        <Link href="/dashboard">Go to dashboard</Link>
      </Button>
    </div>
  );
}
