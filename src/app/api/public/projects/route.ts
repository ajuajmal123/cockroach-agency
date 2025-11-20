// app/api/public/projects/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnect";
import Project from "@/lib/models/Project";
import { IProject } from "@/lib/types/Project";

/** Escape a user string for a literal regex (prevents regex injection) */
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const filter: any = {};
    const q = (searchParams.get("q") || "").trim();
    const rawCategory = searchParams.get("category");
    const rawSub = searchParams.get("subCategory");

    // Category: apply only if provided and not 'all'
    if (rawCategory && rawCategory.toLowerCase() !== "all") {
      // Case-insensitive exact match
      const cat = escapeRegExp(rawCategory.trim());
      filter.category = { $regex: `^${cat}$`, $options: "i" };
    }

    if (rawSub) {
      const sub = escapeRegExp(rawSub.trim());
      filter.subCategory = { $regex: `^${sub}$`, $options: "i" };
    }

    // Text Search (title or description), safe-escaped
    if (q) {
      const safe = escapeRegExp(q);
      filter.$or = [
        { title: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } },
      ];
    }

    // Optional pagination support (non-breaking defaults)
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "48", 10)));
    const skip = (page - 1) * limit;

    const items = await Project.find(filter)
      .select("title description images coverImage category subCategory link")
      .sort({ order: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as unknown as IProject[];

    const total = await Project.countDocuments(filter);

    const outputItems = items.map((item) => ({
      _id: item._id.toString(),
      title: item.title,
      description: item.description,
      images: item.images,
      coverImage: item.coverImage,
      category: item.category,
      subCategory: item.subCategory,
      link: item.link,
    }));

    return NextResponse.json({ items: outputItems, total }, { status: 200 });
  } catch (err: any) {
    console.error("Public projects list error:", err);
    return NextResponse.json({ items: [], total: 0, error: "Failed to fetch projects" }, { status: 500 });
  }
}
