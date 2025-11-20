// app/api/projects/create/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnect";
import Project from "@/lib/models/Project";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(req: Request) {
  try {
    await requireAdmin(req);

    const body = await req.json();
    if (!body.title) return NextResponse.json({ error: "title required" }, { status: 400 });

    await connectDB();
    const doc = await Project.create({
      title: body.title,
      description: body.description || "",
      images: Array.isArray(body.images) ? body.images : [],
      coverImage: Array.isArray(body.images) && body.images.length ? body.images[0] : body.coverImage || "",
      category: body.category || "other",
      subCategory: body.subCategory || "",
    });
    return NextResponse.json(doc, { status: 201 });
  } catch (err: any) {
    console.error("create project error", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
