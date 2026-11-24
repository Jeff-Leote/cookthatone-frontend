import { type NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.API_URL ?? "http://localhost:3001";

const COOKIE = "cto_refresh";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 jours en secondes

export async function POST(req: NextRequest) {
  const body = await req.json();

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    const errResponse = NextResponse.json(
      { message: "Service temporairement indisponible" },
      { status: 502 },
    );
    errResponse.headers.set("Cache-Control", "no-store");
    return errResponse;
  }

  const data = (await upstream.json()) as Record<string, unknown>;

  if (!upstream.ok) {
    const errResponse = NextResponse.json(data, { status: upstream.status });
    errResponse.headers.set("Cache-Control", "no-store");
    return errResponse;
  }

  const { access_token, refresh_token } = data as {
    access_token: string;
    refresh_token: string;
  };

  const response = NextResponse.json({ access_token });
  response.cookies.set(COOKIE, refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/",
    maxAge: COOKIE_MAX_AGE,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
