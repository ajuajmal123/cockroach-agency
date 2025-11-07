import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnect";
import Project from "@/lib/models/Project";

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category") || undefined;
  const subCategory = searchParams.get("subCategory") || undefined;
  const q = searchParams.get("q") || "";
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") || "12", 10), 1),
    48
  );

  const filter: any = {};
  if (category) filter.category = category;
  if (subCategory) filter.subCategory = subCategory;
  if (q) filter.title = { $regex: q, $options: "i" };

  const cursor = Project.find(filter)
    .sort({ featured: -1, order: 1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const [items, total] = await Promise.all([
    cursor,
    Project.countDocuments(filter),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(request: Request) {
  await connectDB();
  const body = await request.json();

  // minimal validation
  if (!body?.title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  // allow single image or array
  const images = Array.isArray(body.images) ? body.images : (body.image ? [body.image] : []);
  const doc = await Project.create({ ...body, images, coverImage: body.coverImage ?? images[0] });

  return NextResponse.json(doc, { status: 201 });
}
