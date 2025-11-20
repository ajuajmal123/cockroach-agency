import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnect";
import Project from "@/lib/models/Project";

/** 
 * Define the shape of a lean Project document.
 * Matches your schema fields, no Mongoose types needed.
 */
type ProjectLean = {
  _id: string | { toString(): string };
  title: string;
  description?: string;
  images?: string[];
  coverImage?: string;
  link?: string;
  category?: string;
  subCategory?: string;
  // add more fields if needed
};

export async function GET(
  req: Request,
  context: { params: { id?: string } | Promise<{ id?: string }> }
) {
  try {
    await connectDB();

    // Unwrap params safely whether it's a Promise or a plain object
    const params = await Promise.resolve(context.params);
    const id = params.id;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Lean query returns plain JS object — cast to our defined type
    const project = (await Project.findById(id).lean()) as ProjectLean | null;

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Always convert _id to string
    const out = {
      ...project,
      _id:
        typeof project._id === "string"
          ? project._id
          : project._id.toString(),
    };

    return NextResponse.json(out, { status: 200 });
  } catch (err) {
    console.error("Public project detail error:", err);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}
