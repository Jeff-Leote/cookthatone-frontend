import { type NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.API_URL ?? "http://localhost:3001";

const COOKIE = "cto_refresh";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(COOKIE)?.value;

  if (refreshToken) {
    // Révoque le token côté backend (best-effort, on déconnecte dans tous
    // les cas même si le backend est temporairement injoignable).
    await fetch(`${BACKEND}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ ok: true });
  // Suppression explicite avec le même path que lors de la pose du cookie.
  // response.cookies.delete() utilise path "/" par défaut, qui ne correspond
  // pas au cookie scoped sur "/api/auth/" → on écrase avec maxAge: 0.
  response.cookies.set({
    name: COOKIE,
    value: "",
    path: "/api/auth/",
    maxAge: 0,
    httpOnly: true,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
