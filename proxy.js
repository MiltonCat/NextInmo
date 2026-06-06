import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { properties, getPropertySlug } from "@/data/properties";

// Next.js 16: este archivo era "middleware.js" y ahora se llama "proxy.js".
// Hace dos cosas, según la ruta:
//   1. /propiedades/<id> → redirige 301 a la URL con slug (SEO).
//   2. /admin/*          → refresca la sesión y bloquea el acceso sin login.
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // --- 1) Redirect 301 de URLs viejas de propiedades (público, sin red) ---
  const match = pathname.match(/^\/propiedades\/(\d+)\/?$/);
  if (match) {
    const id = parseInt(match[1], 10);
    const property = properties.find((p) => p.id === id);
    if (property) {
      const url = request.nextUrl.clone();
      url.pathname = `/propiedades/${getPropertySlug(property)}/`;
      return NextResponse.redirect(url, 301);
    }
    return NextResponse.next();
  }

  // --- 2) Zona privada /admin: refrescar sesión y proteger ---
  if (pathname.startsWith("/admin")) {
    return updateAdminSession(request);
  }

  return NextResponse.next();
}

async function updateAdminSession(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname.startsWith("/admin/login");

  // Sin sesión y fuera del login → mandar al login.
  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Con sesión y en el login → mandar al panel.
  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/propiedades/:path*", "/admin/:path*"],
};
