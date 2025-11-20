// src/app/api/projects/[id]/detachImages/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnect";
import Project from "@/lib/models/Project";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/adminAuth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function publicIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const pathname = u.pathname; // "/.../upload/v1234/folder/name.ext"
    const uploadIdx = pathname.indexOf("/upload/");
    if (uploadIdx === -1) {
      // fallback: return filename without extension
      return pathname.replace(/^\//, "").replace(/\.[^/.]+$/, "");
    }
    let after = pathname.substring(uploadIdx + "/upload/".length);
    after = after.replace(/^v\d+\//, "");
    after = after.replace(/\.[^/.]+$/, "");
    return after;
  } catch (e) {
    return null;
  }
}

export async function POST(req: Request, context: { params?: { id?: string } | Promise<{ id?: string }> }) {
  await requireAdmin(req);
  try {
    await connectDB();
    const params = await Promise.resolve(context.params);
    const id = params?.id;
    if (!id) return NextResponse.json({ error: "Missing project id" }, { status: 400 });

    const body = await req.json().catch(() => ({} as any));
    const images: string[] = Array.isArray(body.images) ? body.images : [];
    const deleteFromCloudinary = body.deleteFromCloudinary !== false;

    if (!images.length) return NextResponse.json({ error: "No images provided" }, { status: 400 });

    // 1) Load project
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // 2) Remove image URLs from the project document (exact matches)
    await Project.findByIdAndUpdate(id, { $pull: { images: { $in: images } } });

    // 3) If one of the removed images was coverImage, set fallback
    if (project.coverImage && images.includes(project.coverImage)) {
      const remaining = (project.images || []).filter((i: string) => !images.includes(i));
      await Project.findByIdAndUpdate(id, { coverImage: remaining.length ? remaining[0] : "" });
    }

    // 4) Attempt deletion from Cloudinary (best effort)
    const results: Array<{ url: string; public_id?: string | null; success: boolean; error?: string }> = [];
    if (deleteFromCloudinary) {
      // Use stored cloudinaryIds if present (recommended). Otherwise derive.
      for (const url of images) {
        let public_id: string | null = null;
        // if you stored mapping (ideal): try to find matching public_id in project.cloudinaryIds
        const cloudIds: string[] = (project as any).cloudinaryIds || [];
        // crude attempt: find cloudId that is substring of url
        public_id = cloudIds.find((cid) => url.includes(cid)) || publicIdFromUrl(url);

        if (!public_id) {
          results.push({ url, public_id: null, success: false, error: "Could not derive public_id" });
          continue;
        }

        try {
          const r: any = await new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(public_id!, { invalidate: true }, (err, res) => (err ? reject(err) : resolve(res)));
          });
          const ok = r?.result === "ok" || r?.result === "deleted" || r?.result === "not_found";
          results.push({ url, public_id, success: !!ok, error: ok ? undefined : JSON.stringify(r) });
          // Also remove the public_id from project's cloudinaryIds array if you keep that
          if (ok && cloudIds.length) {
            await Project.findByIdAndUpdate(id, { $pull: { cloudinaryIds: public_id } });
          }
        } catch (err: any) {
          results.push({ url, public_id, success: false, error: String(err?.message || err) });
        }
      }
    }

    return NextResponse.json({ success: true, removedFromProject: images.length, cloudinary: results }, { status: 200 });
  } catch (err: any) {
    console.error("detachImages error:", err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
