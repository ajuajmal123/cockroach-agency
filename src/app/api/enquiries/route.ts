import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnect";
import Enquiry from "@/lib/models/Enquiry";

/**
 * GET /api/enquiries?page=1&limit=10
 * returns { items: Enquiry[], total: number }
 */
export async function GET(req: Request) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Enquiry.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Enquiry.countDocuments({}),
    ]);

    return NextResponse.json({ items, total }, { status: 200 });
  } catch (err: any) {
    console.error("GET /api/enquiries error:", err);
    return NextResponse.json({ items: [], total: 0, error: String(err?.message || err) }, { status: 500 });
  }
}
