// app/api/projects/[id]/images/route.ts (fixed for Next.js build)
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnect";
import Project from "@/lib/models/Project";
import { requireAdmin } from "@/lib/adminAuth";
import { IProject } from "@/lib/types/Project";

export async function POST(
  req: Request,
  context: { params: { id: string } | Promise<{ id: string }> } // <-- accept Promise OR object
) {
  try {
    await requireAdmin(req);

    // resolve params whether Next provides a Promise or plain object
    const params = await Promise.resolve(context.params);
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

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

    // Cast the result to the IProject interface
    const project = (await Project.findById(id)) as IProject | null;

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (Array.isArray(body.public_ids)) {
      project.cloudinaryIds = Array.from(
        new Set([...(project.cloudinaryIds || []), ...body.public_ids])
      );
    }

    if (Array.isArray(body.images)) {
      project.images = Array.from(new Set([...(project.images || []), ...body.images]));
    }

    if (
      (!project.coverImage || project.coverImage === "") &&
      (project.images && project.images.length > 0)
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
