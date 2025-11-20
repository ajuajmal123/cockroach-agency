// app/api/cloudinary/list/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const folder = url.searchParams.get("folder") || "cockroach-images";
    const next_cursor = url.searchParams.get("next_cursor") || undefined;
    const max_results = Math.min(Number(url.searchParams.get("max_results") || "40"), 100);

    // call Cloudinary admin API
    const res = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,
      max_results,
      next_cursor,
      context: true,
    });

    const items = (res.resources || []).map((r: any) => ({
      public_id: r.public_id,
      url: r.secure_url || r.url,
      width: r.width,
      height: r.height,
      format: r.format,
      created_at: r.created_at,
    }));

    return NextResponse.json({
      items,
      next_cursor: res.next_cursor || null,
      total_count: res.total_count || null,
    });
  } catch (err: any) {
    console.error("Cloudinary list error:", err);
    // If Cloudinary API key missing or invalid, show 500 with helpful message
    return NextResponse.json({ error: "Failed to list images", details: String(err?.message || err) }, { status: 500 });
  }
}
