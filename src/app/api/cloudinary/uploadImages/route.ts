// src/app/api/uploadImages/route.ts (Consolidated Multi-File Upload)
import { requireAdmin } from "@/lib/adminAuth";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// minimal shape we care about from Cloudinary
type CloudinaryUploadResult = {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
};

export async function POST(req: Request) {
  try {
    await requireAdmin(req);

    const form = await req.formData();
    const files = form.getAll("files");
    if (!files || files.length === 0) {
      return NextResponse.json({ message: "No files provided" }, { status: 400 });
    }

    const folder = (form.get("folder") as string) || "cockroach-images";

    const uploadFile = (file: File): Promise<CloudinaryUploadResult> =>
      new Promise(async (resolve, reject) => {
        try {
          const buffer = Buffer.from(await file.arrayBuffer());

          const stream = cloudinary.uploader.upload_stream(
            { folder },
            (err, result) => {
              if (err) return reject(err);
              if (!result) return reject(new Error("Cloudinary returned no result"));
              const typed = result as unknown as CloudinaryUploadResult;
              resolve(typed);
            }
          );
          stream.end(buffer);
        } catch (e) {
          reject(e);
        }
      });

    const fileList = files.filter((f): f is File => f instanceof File);
    const uploads = await Promise.all(fileList.map((f) => uploadFile(f)));

    return NextResponse.json(
      uploads.map((u) => ({
        public_id: u.public_id,
        secure_url: u.secure_url,
        width: u.width,
        height: u.height,
        format: u.format,
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ message: "Upload failed", error: String(error) }, { status: 500 });
  }
}