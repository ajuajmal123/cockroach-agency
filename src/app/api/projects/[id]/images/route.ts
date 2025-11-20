// app/api/projects/[id]/images/route.ts (FIXED)
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnect";
import Project from "@/lib/models/Project";
import { requireAdmin } from "@/lib/adminAuth";
import { IProject } from "@/lib/types/Project"; // 🟢 Import the interface

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(req);

    const body = await req.json();
    if (
      !body ||
      (!Array.isArray(body.images) && !Array.isArray(body.public_ids))
    ) {
      return NextResponse.json(
        { error: "images or public_ids array required" },
        { status: 400 }
      );
    }

    await connectDB();

    // 🟢 Cast the result to the IProject interface
    const project = (await Project.findById(params.id)) as IProject | null;

    if (!project)
      return NextResponse.json({ error: "Project not found" }, { status: 404 }); // If caller sent public_ids, we will store them in cloudinaryIds field (create if missing)

    if (Array.isArray(body.public_ids)) {
      // Mongoose automatically initializes 'cloudinaryIds' if not present based on your schema
      project.cloudinaryIds = Array.from(
        new Set([...project.cloudinaryIds, ...body.public_ids])
      );
    } // If caller sent image URLs, store them in images array

    if (Array.isArray(body.images)) {
      // Mongoose automatically initializes 'images' if not present
      project.images = Array.from(new Set([...project.images, ...body.images]));
    } // optional: set coverImage if missing

    // 🟢 TypeScript now recognizes coverImage and images as properties of 'project'
    if (
      (!project.coverImage || project.coverImage === "") &&
      project.images.length > 0
    ) {
      project.coverImage = project.images[0];
    }

    await project.save();
    return NextResponse.json({ ok: true, project }, { status: 200 });
  } catch (err: any) {
    console.error("attach images error:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
