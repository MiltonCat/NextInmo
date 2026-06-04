import { NextResponse } from "next/server";
import { properties, getPropertySlug } from "@/data/properties";

// Redirige permanente las URLs viejas /propiedades/<id-numerico> al slug descriptivo.
// Esto consolida la autoridad SEO en una sola URL canónica por propiedad.
// Next.js 16: este archivo era "middleware.js" y ahora se llama "proxy.js".
export function proxy(request) {
  const { pathname } = request.nextUrl;

  const match = pathname.match(/^\/propiedades\/(\d+)\/?$/);
  if (!match) return NextResponse.next();

  const id = parseInt(match[1], 10);
  const property = properties.find((p) => p.id === id);
  if (!property) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/propiedades/${getPropertySlug(property)}/`;
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: "/propiedades/:path*",
};
