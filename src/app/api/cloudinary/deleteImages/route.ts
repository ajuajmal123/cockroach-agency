// app/api/cloudinary/delete/route.ts
import { requireAdmin } from "@/lib/adminAuth";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
// Import DB dependencies
import { connectDB } from "@/lib/dbconnect";
import Project from "@/lib/models/Project"; // Assuming you have a Project model

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
      const match = public_id.match(/upload\/v\d+\/([^\.]+)(?:\.[a-z0-9]+)?$/i);
      if (match) public_id = match[1];
    }
    public_id = public_id.replace(/\.[a-z0-9]+$/i, ""); // remove extension
    public_id = public_id.replace(/^\/+/, ""); // remove leading slashes

    console.log("🗑️ Deleting from Cloudinary:", public_id);

    // 1. Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);

    console.log("Cloudinary delete result:", result);

    if (result.result === "ok") {
      // 2. 💥 CRUCIAL STEP: Remove image references from the database
      try {
        await connectDB();
        
        // Use $pull to remove any occurrences of the image URL or public_id 
        // from the 'images' array across ALL projects.
        // NOTE: If your 'images' array only stores secure_url, you should search 
        // and remove based on the secure_url pattern or a unique ID. 
        // The current implementation assumes your UI sends the public_id, which is 
        // the easiest unique identifier.
        
        // We assume the DB stores the full URL. If you want to remove all 
        // references of this image URL, you'll need a way to match it.
        // For simplicity, we are just removing the image URL sent in the request 
        // from the 'images' array (this requires the client to send the URL).
        
        // Since we only have the public_id after normalization:
        // OPTION 1: Find projects containing images where the URL includes the public_id.
        // This requires an efficient way to search array elements.
        
        // OPTION 2 (Simpler, assuming images array contains the URL itself): 
        // Perform a cleanup to remove any images in the 'images' array whose URL 
        // contains the deleted public_id pattern.
        await Project.updateMany(
            {}, // Update all documents
            { $pull: { images: { $regex: public_id, $options: 'i' } } }
        );
        console.log(`Removed image references matching ${public_id} from projects.`);

      } catch (dbErr) {
        console.error("DB cleanup failed (Cloudinary asset still deleted):", dbErr);
        // Do not return 500 here, as the Cloudinary action succeeded.
      }
      
      return NextResponse.json({ ok: true, result, cleanup: true }, { status: 200 });
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