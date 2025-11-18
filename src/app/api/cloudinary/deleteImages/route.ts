// app/api/cloudinary/delete/route.ts
import { requireAdmin } from "@/lib/adminAuth";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    await requireAdmin(req);

    const body = await req.json();
    let public_id: string | undefined = body?.public_id;

    if (!public_id) {
      return NextResponse.json({ error: "public_id required" }, { status: 400 });
    }

    // 🔹 Normalize public_id (strip URL, extension, and extra slashes)
    if (public_id.startsWith("http")) {
      const match = public_id.match(/upload\/([^\.]+)(?:\.[a-z0-9]+)?$/i);
      if (match) public_id = match[1];
    }
    public_id = public_id.replace(/\.[a-z0-9]+$/i, ""); // remove extension
    public_id = public_id.replace(/^\/+/, ""); // remove leading slashes

    console.log("🗑️ Deleting from Cloudinary:", public_id);

    const result = await cloudinary.uploader.destroy(public_id);

    console.log("Cloudinary delete result:", result);

    if (result.result === "ok") {
      return NextResponse.json({ ok: true, result }, { status: 200 });
    } else {
      return NextResponse.json(
        { ok: false, result, error: `Delete failed: ${result.result}` },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error("Delete error:", err);
    return NextResponse.json(
      { error: "Delete failed", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
