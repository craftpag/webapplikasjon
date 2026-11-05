import { NextRequest, NextResponse } from "next/server"

// Rask sjekk før forespørselen når siden: finnes det en sesjons-cookie i det hele tatt?
// Den ekte autorisasjonen (gyldig sesjon og eierskap) skjer på serveren i
// getSession() og i service-laget. Proxy er bare en optimistisk sjekk.
export function proxy(request: NextRequest) {
  const session = request.cookies.get("session")

  if (!session) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/chat/:path*", "/api/conversations/:path*"],
}
