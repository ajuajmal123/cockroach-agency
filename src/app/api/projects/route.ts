// src/app/api/projects/route.ts (FIXED: TS2352)
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbconnect";
import Project from "@/lib/models/Project";
import { requireAdmin } from "@/lib/adminAuth";
// NOTE: Ensure this path and interface name are correct
import { IProject } from "@/lib/types/Project"; 

// GET all projects for the admin table
export async function GET(req: Request) {
  try {
    await requireAdmin(req); 

    await connectDB();
    
    // 🟢 FIX APPLIED: Use 'as unknown as IProject[]' to satisfy the TypeScript compiler
    const projects = await Project.find({}, 'title images coverImage').lean() as unknown as IProject[];

    // TypeScript now correctly infers the type of p._id and other properties
    const output = projects.map(p => ({
        _id: p._id.toString(), 
        title: p.title,
        coverImage: p.coverImage,
        images: p.images,
    }));
    
    return NextResponse.json(output, { status: 200 });
  } catch (err: any) {
    console.error("Get projects list error:", err);
    return NextResponse.json({ error: "Failed to fetch projects list", details: String(err?.message || err) }, { status: 500 });
  }
}