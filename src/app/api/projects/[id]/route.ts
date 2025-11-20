// app/api/projects/[id]/route.ts (UPDATED to satisfy Next.js type checks)
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnect";
import Project from "@/lib/models/Project";
import { requireAdmin } from "@/lib/adminAuth";
import { Types } from "mongoose";

function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}

// Helper function to extract the ID from the URL path (kept for PUT usage)
function getIdFromUrl(reqUrl: string): string | null {
  try {
    const url = new URL(reqUrl);
    const segments = url.pathname.split("/");
    return segments[segments.length - 1];
  } catch (e) {
    return null;
  }
}

// --------------------
// PUT /api/projects/[id] (Update Project)
// --------------------
export async function PUT(req: Request) {
  try {
    await requireAdmin(req);

    const id = getIdFromUrl(req.url);
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid Project ID" }, { status: 400 });
    }

    const body = await req.json();
    const { _id, createdAt, updatedAt, __v, ...updateData } = body; // Filter out system fields

    // Basic validation
    if (!updateData.title) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }

    await connectDB();

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    console.log(`✏️ Successfully updated project: ${id}`);

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (err: any) {
    console.error("PUT project error:", err);
    return NextResponse.json(
      { error: "Server error or validation failed", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}

// --------------------
// GET /api/projects/[id]
// Note: accept context.params as either object or Promise and resolve it
// --------------------
export async function GET(
  req: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);

    // Resolve params whether Next passes a Promise or a plain object
    const params = await Promise.resolve(context.params);
    const id = params?.id;
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid Project ID" }, { status: 400 });
    }

    await connectDB();
    const project = await Project.findById(id).lean();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project, { status: 200 });
  } catch (err: any) {
    console.error("GET project error:", err);
    return NextResponse.json({ error: "Server error", details: String(err?.message || err) }, { status: 500 });
  }
}

// --------------------
// DELETE /api/projects/[id]
// --------------------
export async function DELETE(
  req: Request,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    await requireAdmin(req);

    const params = await Promise.resolve(context.params);
    const id = params?.id;
    if (!id || !isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid Project ID" }, { status: 400 });
    }

    await connectDB();

    const result = await Project.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ error: "Project not found or already deleted" }, { status: 404 });
    }

    console.log(`🗑️ Successfully deleted project: ${id}`);

    return NextResponse.json({ ok: true, message: `Project ${id} deleted` }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE project error:", err);
    return NextResponse.json({ error: "Server error", details: String(err?.message || err) }, { status: 500 });
  }
}
