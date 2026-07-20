import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { properties, getPropertySlug } from "@/data/properties";
import { isAdminUserId } from "@/lib/adminAccess";

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
        setAll(cookiesToSet, responseHeaders) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          Object.entries(responseHeaders).forEach(([name, value]) =>
            response.headers.set(name, value)
          );
        },
      },
    }
  );

  let isAuthenticated = false;

  try {
    const { data, error } = await supabase.auth.getClaims();
    isAuthenticated = !error && isAdminUserId(data?.claims?.sub);
  } catch {
    // Una sesión corrupta o un fallo de Auth se trata como sesión ausente.
    // Supabase elimina las cookies inválidas mediante setAll cuando corresponde.
    isAuthenticated = false;
  }

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname.startsWith("/admin/login");

  // Sin sesión y fuera del login → mandar al login.
  if (!isAuthenticated && !isLoginPage) {
    return redirectWithAuthState(request, "/admin/login", response);
  }

  // Con sesión y en el login → mandar al panel.
  if (isAuthenticated && isLoginPage) {
    return redirectWithAuthState(request, "/admin", response);
  }

  return response;
}

function redirectWithAuthState(request, pathname, authResponse) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;

  const redirectResponse = NextResponse.redirect(url);

  // Conserva tokens renovados o cookies eliminadas por Supabase. Sin esto,
  // una redirección puede volver a enviar el refresh token inválido anterior.
  authResponse.cookies.getAll().forEach((cookie) =>
    redirectResponse.cookies.set(cookie)
  );

  ["cache-control", "expires", "pragma"].forEach((header) => {
    const value = authResponse.headers.get(header);
    if (value) redirectResponse.headers.set(header, value);
  });

  return redirectResponse;
}

export const config = {
  matcher: ["/propiedades/:path*", "/admin/:path*"],
};
