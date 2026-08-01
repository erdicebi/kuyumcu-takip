import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function refreshAuthSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;

  const isLoginRoute = pathname === "/giris";
  const isPublicRoute =
    isLoginRoute ||
    pathname === "/offline.html" ||
    pathname.startsWith("/auth/");

  // Giriş sayfasını Supabase bağlantısından önce aç.
  // Böylece bağlantı sorunu olsa bile giriş ekranı çökmeyecek.
  if (isPublicRoute) {
    return response;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/giris";
    return NextResponse.redirect(loginUrl);
  }

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/giris";
      loginUrl.searchParams.set("sonraki", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  } catch {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/giris";
    return NextResponse.redirect(loginUrl);
  }
}
