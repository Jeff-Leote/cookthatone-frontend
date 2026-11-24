import { type NextRequest, NextResponse } from "next/server";

const BACKEND =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000";

const COOKIE = "cto_refresh";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(COOKIE)?.value;
  if (!refreshToken) {
    const errResponse = NextResponse.json(
      { message: "No session" },
      { status: 401 },
    );
    errResponse.headers.set("Cache-Control", "no-store");
    return errResponse;
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    const errResponse = NextResponse.json(
      { message: "Service temporairement indisponible" },
      { status: 502 },
    );
    errResponse.headers.set("Cache-Control", "no-store");
    return errResponse;
  }

  if (!upstream.ok) {
    const errResponse = NextResponse.json(
      { message: "Session expirée" },
      { status: 401 },
    );
    errResponse.cookies.delete(COOKIE);
    errResponse.headers.set("Cache-Control", "no-store");
    return errResponse;
  }

  const data = (await upstream.json()) as {
    access_token: string;
    refresh_token: string;
  };

  const response = NextResponse.json({ access_token: data.access_token });
  response.cookies.set(COOKIE, data.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth/",
    maxAge: COOKIE_MAX_AGE,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
