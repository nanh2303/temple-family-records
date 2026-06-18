import { type NextRequest, NextResponse } from "next/server";

import { createProxySupabaseClient } from "@/lib/supabase/proxy";

const ADMIN_PATH_PREFIXES = ["/dashboard", "/devotees"];
const PROTECTED_API_PREFIXES = ["/api/devotees", "/api/pdf"];

function isAdminPath(pathname: string) {
  return ADMIN_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isProtectedApi(pathname: string) {
  return PROTECTED_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAdminPath(pathname) && !isProtectedApi(pathname)) {
    return NextResponse.next();
  }

  const { supabase, response } = createProxySupabaseClient(request);

  if (!supabase) {
    if (isProtectedApi(pathname)) {
      return NextResponse.json(
        { error: "Server misconfiguration: Supabase environment variables are not set." },
        { status: 503 },
      );
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("error", "config");
    return NextResponse.redirect(loginUrl);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isProtectedApi(pathname)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/devotees",
    "/devotees/:path*",
    "/api/devotees/:path*",
    "/api/pdf/:path*",
  ],
};
