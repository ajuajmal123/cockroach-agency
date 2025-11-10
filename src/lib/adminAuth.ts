// lib/adminAuth.ts
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "dev-secret";
const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "admin_token";
const COOKIE_MAX_AGE = Number(process.env.ADMIN_COOKIE_MAX_AGE || "86400"); // seconds

export type AdminPayload = {
  email: string;
  iat?: number;
  exp?: number;
};

export function signAdminToken(payload: AdminPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: COOKIE_MAX_AGE });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch (e) {
    return null;
  }
}

/** Helper to require admin in server route handlers.
    Call like: const admin = await requireAdmin(req); */
export async function requireAdmin(req: Request) {
  // cookie parsing (simple)
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  const token = match?.[1];
  if (!token) {
    throw { status: 401, message: "Not authenticated" };
  }
  const payload = verifyAdminToken(token);
  if (!payload) throw { status: 401, message: "Invalid token" };
  return payload; // { email }
}

/** Returns a NextResponse with Set-Cookie for login */
export function makeLoginResponse(data: object, token: string) {
  const cookieParts = [
    `${process.env.ADMIN_COOKIE_NAME || COOKIE_NAME}=${token}`,
    `Path=/`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    `HttpOnly`,
    `SameSite=Strict`,
  ];

  // secure cookie only on production over https
  if (process.env.NODE_ENV === "production") cookieParts.push("Secure");

  const res = NextResponse.json(data);
  res.headers.set("Set-Cookie", cookieParts.join("; "));
  return res;
}

/** Make logout response (clear cookie) */
export function makeLogoutResponse() {
  const res = NextResponse.json({ ok: true });
  res.headers.set(
    "Set-Cookie",
    `${process.env.ADMIN_COOKIE_NAME || COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict`
  );
  return res;
}
