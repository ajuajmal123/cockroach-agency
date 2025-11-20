// app/api/admin/me/route.ts
import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|; )admin_token=([^;]+)/);
    const token = match?.[1];
    if (!token) return NextResponse.json({ authenticated: false });

    const payload = verifyAdminToken(token);
    if (!payload) return NextResponse.json({ authenticated: false });

    return NextResponse.json({ authenticated: true, email: payload.email });
  } catch (err) {
    console.error("admin/me error", err);
    return NextResponse.json({ authenticated: false });
  }
}
