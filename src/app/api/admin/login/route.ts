// app/api/admin/login/route.ts
import { NextResponse } from "next/server";
import { signAdminToken, makeLoginResponse } from "@/lib/adminAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || "").toString().trim().toLowerCase();
    const password = (body.password || "").toString();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

    // simple plain-text compare (WARNING: not for production)
    const ok = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;

    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signAdminToken({ email });
    return makeLoginResponse({ ok: true, email }, token);
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
